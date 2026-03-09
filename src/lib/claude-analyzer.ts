export interface AnalysisResult {
  fitScore: number;
  fitSummary: string;
  missingSkills: string[];
  payGapContext: string;
  salaryNegotiationTips: string[];
  coverLetter: string;
}

export async function analyzeJobFitWithClaude(
  jobDescription: string,
  cvText: string
): Promise<AnalysisResult> {
  try {
    const response = await fetch('/.netlify/functions/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobDescription, cvText }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', errorData);
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();

    if (!result.fitScore || !result.fitSummary || !result.missingSkills ||
        !result.payGapContext || !result.salaryNegotiationTips || !result.coverLetter) {
      throw new Error('Invalid response format from API');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to analyze job fit');
  }
}
