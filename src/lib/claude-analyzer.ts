import i18n from '../i18n';
import { retryWithBackoff } from './utils';

export interface AnalysisResult {
  fitScore: number;
  fitSummary: string;
  missingSkills: string[];
  payGapContext: string;
  salaryNegotiationTips: string[];
  coverLetter: string;
}

/** Get user-provided API key from localStorage if set */
function getUserApiKey(): string | null {
  return localStorage.getItem('fairhire-api-key');
}

export async function analyzeJobFitWithClaude(
  jobDescription: string,
  cvText: string,
  language: string = 'es'
): Promise<AnalysisResult> {
  const userKey = getUserApiKey();

  const makeRequest = async (): Promise<AnalysisResult> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (userKey) {
      headers['X-Anthropic-Key'] = userKey;
    }

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jobDescription,
        cvText,
        language,
      }),
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