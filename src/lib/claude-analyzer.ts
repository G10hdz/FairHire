export interface AnalysisResult {
  fitScore: number;
  fitSummary: string;
  missingSkills: string[];
  payGapContext: string;
  salaryNegotiationTips: string[];
  coverLetter: string;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export async function analyzeJobFitWithClaude(
  jobDescription: string,
  cvText: string
): Promise<AnalysisResult> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
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

        if (response.status === 529 && attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          console.warn(`Service overloaded (529). Retrying in ${delay}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

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

  throw new Error('Service unavailable after multiple retries');
}
