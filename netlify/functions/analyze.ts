import type { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { Allow: "POST" }, body: "Method Not Allowed" };
  }

  try {
    const { jobDescription, cvText } = JSON.parse(event.body || "{}");

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "API key not configured" }) };
    }

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
        system: `You are FairHire, an AI career analyst focused on gender equity. Analyze the Job Description and CV provided. Return ONLY a valid JSON object with these fields: fitScore (number 0-100), fitSummary (2 sentences in Spanish), missingSkills (array of 3-5 gaps in Spanish), payGapContext (gender pay gap for this role in Mexico in Spanish), salaryNegotiationTips (array of 3 tips in Spanish), coverLetter (3-paragraph cover letter in Spanish). Return ONLY valid JSON, no markdown, no preamble.`,
        messages: [{ role: "user", content: `Job Description:\n${jobDescription}\n\nCV:\n${cvText}` }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { statusCode: response.status, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: data.error?.message || "API error"
