import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
const MAX_INPUT_LENGTH = 10000;

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type"
};

// System prompts in both languages
const SYSTEM_PROMPTS = {
  es: `Eres un experto en recursos humanos especializado en equidad de género y análisis de fit laboral en la industria tecnológica. Tu objetivo es analizar de manera justa y objetiva la correspondencia entre el CV de una candidata y la descripción del trabajo, identificando tanto las fortalezas como las áreas de mejora. También debes proporcionar contexto sobre brechas salariales de género y consejos de negociación salarial empoderadores.

Importante:
- Sé objetivo y justo en tu evaluación
- Considera que las mujeres en tech enfrentan brechas salariales del 15-25%
- Proporciona consejos de negociación prácticos y empoderadores
- Mantén un tono profesional pero cercano
- Responde SIEMPRE en español`,

  en: `You are an HR expert specializing in gender equity and job fit analysis in the tech industry. Your goal is to fairly and objectively analyze the match between a candidate's CV and the job description, identifying both strengths and areas for improvement. You should also provide context on gender pay gaps and empowering salary negotiation advice.

Important:
- Be objective and fair in your evaluation
- Consider that women in tech face 15-25% pay gaps
- Provide practical and empowering negotiation tips
- Maintain a professional yet approachable tone
- ALWAYS respond in English`
};

// User prompt templates in both languages
const USER_TEMPLATES = {
  es: `Por favor analiza el siguiente fit laboral:

DESCRIPCIÓN DEL TRABAJO:
{{jobDescription}}

CV DE LA CANDIDATA:
{{cvText}}

Proporciona un análisis estructurado con:
1. fitScore: número del 0-100
2. fitSummary: resumen conciso del fit (2-3 frases)
3. missingSkills: array de habilidades faltantes (máximo 5-6)
4. payGapContext: contexto sobre brecha salarial relevante para este puesto
5. salaryNegotiationTips: array de 3-4 tips de negociación
6. coverLetter: carta de presentación personalizada

Responde en formato JSON válido.`,

  en: `Please analyze the following job fit:

JOB DESCRIPTION:
{{jobDescription}}

CANDIDATE'S CV:
{{cvText}}

Provide a structured analysis with:
1. fitScore: number from 0-100
2. fitSummary: concise summary of the fit (2-3 sentences)
3. missingSkills: array of missing skills (maximum 5-6)
4. payGapContext: context about relevant pay gap for this position
5. salaryNegotiationTips: array of 3-4 negotiation tips
6. coverLetter: personalized cover letter

Respond in valid JSON format.`
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
function buildSystemPrompt(language: 'es' | 'en', inegiContext?: string): string {
  const basePrompt = SYSTEM_PROMPTS[language];

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

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).setHeader("Access-Control-Allow-Origin", "*").setHeader("Access-Control-Allow-Headers", "Content-Type").send("");
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  (async () => {
    try {
      const { jobDescription, cvText, language = 'es' } = req.body || {};

      // Validate language parameter
      const validLanguage = (language === 'es' || language === 'en') ? language : 'es';

      if (!jobDescription || !cvText) {
        return res.status(400).setHeader("Access-Control-Allow-Origin", "*").json({ error: "Missing jobDescription or cvText" });
      }

      // 🔴 Fix 1: límite de input para evitar quema de créditos
      if (jobDescription.length > MAX_INPUT_LENGTH || cvText.length > MAX_INPUT_LENGTH) {
        return res.status(400).setHeader("Access-Control-Allow-Origin", "*").json({
          error: `Input too long. Maximum ${MAX_INPUT_LENGTH} characters per field.`,
        });
      }

      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(500).setHeader("Access-Control-Allow-Origin", "*").json({ error: "Service unavailable. Please try again later." });
      }

      // Build system prompt with INEGI context
      const inegiContext = getINEGIContext();
      const systemPrompt = buildSystemPrompt(validLanguage, inegiContext);

      // Build user prompt with language-specific template
      const userTemplate = USER_TEMPLATES[validLanguage];
      const userMessage = userTemplate
        .replace('{{jobDescription}}', jobDescription)
        .replace('{{cvText}}', cvText);

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
              content: userMessage,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "Unknown error");
        console.error("Anthropic API error:", response.status, errorBody);

        if (response.status === 429) {
          return res.status(429).setHeader("Access-Control-Allow-Origin", "*").json({ error: "Rate limit exceeded. Please try again later." });
        }

        return res.status(response.status).setHeader("Access-Control-Allow-Origin", "*").json({ error: `AI API error: ${response.status}` });
      }

      const data = await response.json();

      if (!data?.content || !Array.isArray(data.content) || data.content.length === 0) {
        console.error("Invalid API response structure:", data);
        return res.status(500).setHeader("Access-Control-Allow-Origin", "*").json({ error: "Invalid response from AI service" });
      }

      const firstContent = data.content[0];
      if (!firstContent || typeof firstContent.text !== "string") {
        console.error("Invalid content structure:", firstContent);
        return res.status(500).setHeader("Access-Control-Allow-Origin", "*").json({ error: "Invalid content format from AI service" });
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
        return res.status(500).setHeader("Access-Control-Allow-Origin", "*").json({ error: "Error al procesar la respuesta. Intenta de nuevo." });
      }

      return res.status(200).setHeader("Access-Control-Allow-Origin", "*").send(cleanJson);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Analysis error:", errorMessage);
      return res.status(500).setHeader("Access-Control-Allow-Origin", "*").json({ error: "Analysis failed" });
    }
  })();
}
