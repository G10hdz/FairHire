import type { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { jobDescription, cvText, apiKey } = JSON.parse(event.body || "{}");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: `You are FairHire, an AI career analyst focused on gender equity. 
Analyze the Job Description and CV provided. Return ONLY a valid JSON object with these fields:
- fitScore: number 0-100
- fitSummary: 2 sentences explaining the score in Spanish
- missingSkills: array of 3-5 skill gaps in Spanish
- payGapContext: string about gender pay gap for this role in Mexico in Spanish, referencing INEGI or OIT data
- salaryNegotiationTips: array of 3 tips in Spanish
- coverLetter: 3-paragraph cover letter in Spanish
Return ONLY valid JSON, no markdown, no preamble.`,
        messages: [
          {
            role: "user",
            content: `Job Description:\n${jobDescription}\n\nCV:\n${cvText}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content[0].text;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: text,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Analysis failed" }),
    };
  }
};

export { handler };
```

---

**Pasos para subirlo:**

1. Ve a `github.com/G10hdz/fairfit-ai`
2. Click **"Add file" → "Create new file"**
3. En el nombre escribe: `netlify/functions/analyze.ts`
4. Pega el código
5. Click **"Commit changes"**

---

**Luego en `src/lib/claude-analyzer.ts` necesitas cambiar la URL del fetch a:**
```
/.netlify/functions/analyze
