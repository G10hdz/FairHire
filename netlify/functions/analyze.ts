import type { Handler } from "@netlify/functions";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
const MAX_INPUT_LENGTH = 10000;

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
};

/**
 * Load INEGI salary benchmark data for contextualizing the analysis
 */
function loadINEGIData(): { nacional: { brecha_pct: number; hombre: number; mujer: number } } | null {
  try {
    const dataPath = process.env.INEGI_DATA_PATH || join(__dirname, "data", "salary_benchmarks.json");
    
    if (existsSync(dataPath)) {
      const fileContent = readFileSync(dataPath, "utf-8");
      const data = JSON.parse(fileContent);
      return {
        nacional: {
          brecha_pct: data.datos?.nacional?.brecha_pct ?? 13.0,
          hombre: data.datos?.nacional?.hombre ?? 12500,
          mujer: data.datos?.nacional?.mujer ?? 10875
        }
      };
    }
  } catch (error) {
    console.error("Error loading INEGI data:", error);
  }
  
  // Fallback defaults
  return {
    nacional: {
      brecha_pct: 13.0,
      hombre: 12500,
      mujer: 10875
    }
  };
}

/**
 * Build system prompt with INEGI context for gender equity analysis
 */
function buildSystemPrompt(inegiContext?: string): string {
  const basePrompt = "You are FairHire, an AI career analyst focused on gender equity. Analyze the Job Description and CV provided. Return ONLY a valid JSON object with: fitScore (number 0-100), fitSummary (2 sentences in Spanish), missingSkills (array of 3-5 gaps in Spanish), payGapContext (gender pay gap for this role in Mexico in Spanish), salaryNegotiationTips (array of 3 tips in Spanish), coverLetter (3-paragraph cover letter in Spanish). Return ONLY valid JSON, no markdown.";
  
  if (inegiContext) {
    return `${basePrompt}\n\n${inegiContext}`;
  }
  
  return basePrompt;
}

/**
 * Generate INEGI context string for the system prompt
 */
function getINEGIContext(): string {
  const inegiData = loadINEGIData();
  
  if (!inegiData) {
    return "";
  }

  return `CONTEXTO SALARIAL MÉXICO (INEGI-ENOE 2024-T4):
- Brecha nacional: ${inegiData.nacional.brecha_pct}%
- Salario promedio nacional: $${inegiData.nacional.hombre.toLocaleString('es-MX')} (hombres) vs $${inegiData.nacional.mujer.toLocaleString('es-MX')} (mujeres)
- Fuente: INEGI ENOE 2024-T4

Cuando analices el fit laboral, considera si el salario ofrecido está en línea con el mercado y si existe brecha de género en esta ocupación específica. Menciona la brecha salarial cuando sea relevante para el análisis.`;
}

const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { jobDescription, cvText } = JSON.parse(event.body || "{}");

    if (!jobDescription || !cvText) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Missing jobDescription or cvText" }),
      };
    }

    // 🔴 Fix 1: límite de input para evitar quema de créditos
    if (jobDescription.length > MAX_INPUT_LENGTH || cvText.length > MAX_INPUT_LENGTH) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: `Input too long. Maximum ${MAX_INPUT_LENGTH} characters per field.`,
        }),
      };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Service unavailable. Please try again later." }),
      };
    }

    // Build system prompt with INEGI context
    const inegiContext = getINEGIContext();
    const systemPrompt = buildSystemPrompt(inegiContext);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Job Description:\n${jobDescription}\n\nCV:\n${cvText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      console.error("Anthropic API error:", response.status, errorBody);

      if (response.status === 429) {
        return {
          statusCode: 429,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        };
      }

      return {
        statusCode: response.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: `AI API error: ${response.status}` }),
      };
    }

    const data = await response.json();

    if (!data?.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error("Invalid API response structure:", data);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Invalid response from AI service" }),
      };
    }

    const firstContent = data.content[0];
    if (!firstContent || typeof firstContent.text !== "string") {
      console.error("Invalid content structure:", firstContent);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Invalid content format from AI service" }),
      };
    }

    const rawText = firstContent.text;
    const cleanJson = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // 🔴 Fix 2: validar que sea JSON real antes de retornar 200
    try {
      JSON.parse(cleanJson);
    } catch {
      console.error("Model returned invalid JSON:", rawText);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Error al procesar la respuesta. Intenta de nuevo." }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: cleanJson,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Analysis error:", errorMessage);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Analysis failed" }),
    };
  }
};

export { handler };
