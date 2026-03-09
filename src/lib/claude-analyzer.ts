export interface AnalysisResult {
  fitScore: number;
  fitSummary: string;
  missingSkills: string[];
  payGapContext: string;
  salaryNegotiationTips: string[];
  coverLetter: string;
}

const SYSTEM_PROMPT = `You are FairHire, an AI career analyst focused on gender equity. 

Analyze the Job Description and CV provided. Return ONLY a valid 

JSON object with these fields:

- fitScore: number 0-100

- fitSummary: 2 sentences explaining the score in Spanish

- missingSkills: array of 3-5 skill gaps in Spanish

- payGapContext: string about gender pay gap for this role in 

  Mexico in Spanish, referencing INEGI or OIT data

- salaryNegotiationTips: array of 3 tips in Spanish

- coverLetter: 3-paragraph cover letter in Spanish

Return ONLY valid JSON, no markdown, no preamble.`;

export async function analyzeJobFitWithClaude(
  jobDescription: string, 
  cvText: string, 
  apiKey: string
): Promise<AnalysisResult> {
  if (!apiKey.trim()) {
    throw new Error('API key is required');
  }

  const prompt = `Job Description:\n${jobDescription}\n\nCV:\n${cvText}`;

  try {
    const response = await fetch('https://corsproxy.io/?https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', errorData);
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Parse JSON response
    const result = JSON.parse(content);
    
    // Validate required fields
    if (!result.fitScore || !result.fitSummary || !result.missingSkills || 
        !result.payGapContext || !result.salaryNegotiationTips || !result.coverLetter) {
      throw new Error('Invalid response format from API');
    }

    return result;
  } catch (error) {
    console.error('Claude API Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to analyze job fit');
  }
}