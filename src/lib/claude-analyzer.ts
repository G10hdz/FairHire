export interface AnalysisResult {
  fitScore: number;
  fitSummary: string;
  missingSkills: string[];
  payGapContext: string;
  salaryNegotiationTips: string[];
  coverLetter: string;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries || !(error instanceof Error) || !error.message.includes('API Error: 529')) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export async function analyzeJobFitWithClaude(
  jobDescription: string,
  cvText: string
): Promise<AnalysisResult> {
  const makeRequest = async (): Promise<AnalysisResult> => {
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
  };

  try {
    return await retryWithBackoff(makeRequest, 3, 1000);
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to analyze job fit');
  }
}