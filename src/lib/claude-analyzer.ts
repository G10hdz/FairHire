import { supabase } from "@/integrations/supabase/client";

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
  const { data, error } = await supabase.functions.invoke("analyze", {
    body: { jobDescription, cvText },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(error.message || "Failed to analyze job fit");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  // Validate required fields
  if (
    !data.fitScore ||
    !data.fitSummary ||
    !data.missingSkills ||
    !data.payGapContext ||
    !data.salaryNegotiationTips ||
    !data.coverLetter
  ) {
    throw new Error("Invalid response format from API");
  }

  return data;
}
