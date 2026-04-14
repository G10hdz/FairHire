import { useState, lazy, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { analyzeJobFitWithClaude, type AnalysisResult } from "@/lib/claude-analyzer";
import { FitScoreCard } from "@/components/FitScoreCard";
import { MissingSkillsCard } from "@/components/MissingSkillsCard";
import { PayGapCard } from "@/components/PayGapCard";
import { SalaryTipsCard } from "@/components/SalaryTipsCard";
import { CoverLetterCard } from "@/components/CoverLetterCard";
import { LanguageToggle } from "@/components/LanguageToggle/LanguageToggle";
import { OnboardingModal } from "@/components/OnboardingModal";
import { HowItWorks } from "@/components/HowItWorks";
import { AlertTriangle, ClipboardList, FileText, Sparkles, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSalaryBenchmark } from "@/hooks/useSalaryBenchmark";

// Lazy load SalaryBenchmark for better performance
const SalaryBenchmark = lazy(() => import("@/components/SalaryBenchmark").then(module => ({
  default: module.SalaryBenchmark
})));

const Index = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [cvText, setCvText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  // Show onboarding on first visit
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("fairhire-onboarding-seen");
    if (!hasSeenOnboarding) {
      setTimeout(() => setShowOnboarding(true), 500);
    }
  }, []);

  // Get current language for API calls
  const currentLanguage = i18n.language.split('-')[0]; // 'es' or 'en'

  // Fetch INEGI benchmark data
  const { data: benchmark, isLoading: isBenchmarkLoading } = useSalaryBenchmark({
    sinco: "2111",
    entidad: "09"
  });

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || !cvText.trim()) {
      setError("Por favor ingresa tanto la descripción del trabajo como tu CV");
      toast({
        title: "Falta información",
        description: "Necesitamos ambos textos para hacer el análisis",
        variant: "destructive",
      });
      return;
    }

    if (jobDescription.length < 50) {
      setError("La descripción del trabajo es muy corta (mínimo 50 palabras)");
      toast({
        title: "Descripción muy corta",
        description: "Copia la descripción completa para un análisis más preciso",
        variant: "destructive",
      });
      return;
    }

    if (cvText.length < 50) {
      setError("Tu CV es muy corto (mínimo 50 palabras)");
      toast({
        title: "CV muy corto",
        description: "Incluye más detalles sobre tu experiencia para un mejor análisis",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysisResult = await analyzeJobFitWithClaude(jobDescription, cvText, currentLanguage);
      setResults(analysisResult);
      setShowResults(true);
      toast({
        title: t("messages.analysisComplete"),
        description: "✨ Tu análisis está listo — revisa tus insights y herramientas abajo",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error
        ? error.message.includes("API")
          ? "No pudimos conectar con el servicio de análisis. Verifica tu conexión e intenta de nuevo."
          : error.message
        : "Ocurrió un error inesperado. Inténtalo de nuevo en unos momentos.";
      setError(errorMessage);
      toast({
        title: t("messages.analysisError"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setShowResults(false);
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background bg-dot-grid relative">
      {/* Glass Nav Bar */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-lavender/15">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <h1 className="font-orbitron text-xl font-bold tracking-[0.15em] uppercase text-lavender">
            {t("app.name")}
          </h1>
          <LanguageToggle />
        </div>
      </nav>

      <div className="container mx-auto px-8 py-16">
        {!showResults ? (
          /* === INPUT FORM === */
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Hero */}
            <div className="text-center space-y-6">
              <h2 className="font-headline text-5xl md:text-6xl font-bold text-foreground tracking-tight">
                {t("home.title")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
                {t("home.description")}
              </p>
            </div>

            {/* How it works */}
            <div className="max-w-3xl mx-auto">
              <HowItWorks />
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="max-w-2xl mx-auto pink-alert">
                <AlertTriangle className="h-4 w-4 text-pink-biological" />
                <AlertDescription className="text-foreground">{error}</AlertDescription>
              </Alert>
            )}

            {/* Input Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Job Description Card */}
              <div className="glass-card p-8 min-h-[350px] flex flex-col">
                <label className="font-orbitron text-xs uppercase tracking-[0.2em] text-surface-tint mb-6">
                  <ClipboardList className="w-4 h-4 inline mr-2" />
                  {t("home.form.jobDescription.title")}
                </label>
                <Textarea
                  placeholder={t("placeholders.jobDescription")}
                  className="flex-1 min-h-[200px] resize-none ghost-input font-body text-foreground placeholder:text-muted-foreground/60"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {/* CV Card */}
              <div className="glass-card p-8 min-h-[350px] flex flex-col">
                <label className="font-orbitron text-xs uppercase tracking-[0.2em] text-surface-tint mb-6">
                  <FileText className="w-4 h-4 inline mr-2" />
                  {t("home.form.cv.title")}
                </label>
                <Textarea
                  placeholder={t("placeholders.cv")}
                  className="flex-1 min-h-[200px] resize-none ghost-input font-body text-foreground placeholder:text-muted-foreground/60"
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                />
              </div>
            </div>

            {/* Analyze Button */}
            <div className="text-center space-y-4">
              <Button
                onClick={handleAnalyze}
                disabled={!jobDescription.trim() || !cvText.trim() || isAnalyzing}
                className="px-12 py-6 text-lg font-semibold text-foreground bg-gradient-primary rounded-sm transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(196,181,227,0.4)] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                    {t("actions.analyzing")}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    {t("actions.analyze")}
                  </div>
                )}
              </Button>
              <p className="text-sm text-muted-foreground font-orbitron tracking-wider">
                {t("labels.aiPowered")}
              </p>
            </div>
          </div>
        ) : (
          /* === RESULTS DASHBOARD === */
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Header */}
            <div className="space-y-6">
              <Button
                variant="outline"
                onClick={handleNewAnalysis}
                className="ghost-border text-lavender hover:text-lavender-dim hover:bg-lavender/5 rounded-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("actions.newAnalysis")}
              </Button>

              <div className="space-y-3">
                <h2 className="font-headline text-4xl font-bold text-foreground">
                  {t("labels.analysisCompleted")}
                </h2>
                <div className="gradient-divider w-full max-w-md" />
              </div>

              <p className="text-lg text-muted-foreground max-w-2xl font-body">
                {t("analysis.summary.encouragement")}
              </p>
            </div>

            {results && (
              <>
                {/* Section 1: Insights */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-lavender/15" />
                    <h3 className="font-orbitron text-xs uppercase tracking-[0.2em] text-lavender-dim whitespace-nowrap">
                      {t("analysis.sections.insights")}
                    </h3>
                    <div className="h-px flex-1 bg-lavender/15" />
                  </div>

                  <div className="space-y-8">
                    {/* Pay Gap Context */}
                    <PayGapCard context={results.payGapContext} />

                    {/* INEGI Salary Benchmark */}
                    {isBenchmarkLoading ? (
                      <div className="glass-card p-8">
                        <div className="space-y-4">
                          <div className="h-4 bg-muted rounded animate-pulse w-48" />
                          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                        </div>
                      </div>
                    ) : benchmark ? (
                      <Suspense fallback={
                        <div className="glass-card p-8">
                          <div className="h-20 bg-muted rounded animate-pulse" />
                        </div>
                      }>
                        <SalaryBenchmark data={benchmark} />
                      </Suspense>
                    ) : null}

                    {/* Fit Score + Missing Skills */}
                    <div className="grid lg:grid-cols-2 gap-8">
                      <FitScoreCard score={results.fitScore} summary={results.fitSummary} />
                      <MissingSkillsCard skills={results.missingSkills} />
                    </div>
                  </div>
                </section>

                {/* Section 2: Actions */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-lavender/15" />
                    <h3 className="font-orbitron text-xs uppercase tracking-[0.2em] text-lavender-dim whitespace-nowrap">
                      {t("analysis.sections.actions")}
                    </h3>
                    <div className="h-px flex-1 bg-lavender/15" />
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Salary Tips - 2/3 width */}
                    <div className="lg:col-span-2">
                      <SalaryTipsCard tips={results.salaryNegotiationTips} />
                    </div>

                    {/* Cover Letter - 1/3 width */}
                    <div className="lg:col-span-1">
                      <CoverLetterCard coverLetter={results.coverLetter} />
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-lavender/15 py-12 mt-24">
        <div className="container mx-auto px-8">
          <div className="text-center space-y-4">
            <p className="font-orbitron text-xs uppercase tracking-[0.15em] text-muted-foreground">
              {t("app.footer")}
            </p>
            <p className="text-xs text-muted-foreground font-body">
              {t("app.copyright")}
            </p>
            <a
              href="https://positronicalabs.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-medium ghost-border text-lavender-dim hover:bg-lavender/5 hover:border-lavender/40 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
              Positronica Labs
            </a>
          </div>
        </div>
      </footer>

      {/* Onboarding Modal */}
      <OnboardingModal
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onGetStarted={() => {
          const firstTextarea = document.querySelector('textarea');
          firstTextarea?.focus();
        }}
      />

      <Toaster />
    </div>
  );
};

export default Index;
