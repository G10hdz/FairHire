import { useState, lazy, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AlertTriangle, ClipboardList, FileText, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSalaryBenchmark, getSINCODivision } from "@/hooks/useSalaryBenchmark";

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
      // Small delay to ensure page is loaded
      setTimeout(() => setShowOnboarding(true), 500);
    }
  }, []);

  // Get current language for API calls
  const currentLanguage = i18n.language.split('-')[0]; // 'es' or 'en'

  // Fetch INEGI benchmark data (national level by default)
  const { data: benchmark, isLoading: isBenchmarkLoading } = useSalaryBenchmark({
    sinco: "2111", // Default to software engineers (division 2 = Profesionistas y técnicos)
    entidad: "09"  // CDMX
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">{t("app.name")}</h1>
              <p className="text-sm text-muted-foreground">{t("app.tagline")}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="hidden md:block">
                {t("app.tagline")}
              </Badge>
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!showResults ? (
          /* Input Form */
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold text-foreground">
                {t("home.title")}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("home.description")}
              </p>
            </div>

            {/* How it works - Expandable section */}
            <div className="max-w-2xl mx-auto">
              <HowItWorks />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <ClipboardList className="w-6 h-6" />
                    {t("home.form.jobDescription.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("home.form.jobDescription.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={t("placeholders.jobDescription")}
                    className="min-h-[200px] resize-none border-muted focus:border-primary"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </CardContent>
              </Card>

              <Card className="border-2 border-secondary/40 hover:border-secondary/60 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-secondary-foreground">
                    <FileText className="w-6 h-6" />
                    {t("home.form.cv.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("home.form.cv.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={t("placeholders.cv")}
                    className="min-h-[200px] resize-none border-muted focus:border-secondary"
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button
                onClick={handleAnalyze}
                disabled={!jobDescription.trim() || !cvText.trim() || isAnalyzing}
                className="px-12 py-3 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105 active:scale-95"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                    {t("actions.analyzing")}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {t("actions.analyze")}
                  </div>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                {t("labels.aiPowered")}
              </p>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Header with empowerment message */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-primary">{t("labels.analysisCompleted")}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("analysis.summary.encouragement")}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResults(false);
                  setResults(null);
                  setError(null);
                }}
                className="text-sm"
              >
                ← {t("actions.newAnalysis")}
              </Button>
            </div>

            {results && (
              <>
                {/* Section 1: Insights (Context & Data) */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("analysis.sections.insights")}
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* Pay Gap Context - Lead with systemic validation */}
                  <div className="grid gap-6">
                    <PayGapCard context={results.payGapContext} />
                    
                    {/* INEGI Salary Benchmark Data */}
                    {isBenchmarkLoading ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            {t("benchmark.title")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                          </div>
                        </CardContent>
                      </Card>
                    ) : benchmark ? (
                      <Suspense fallback={
                        <Card>
                          <CardHeader>
                            <CardTitle>{t("benchmark.title")}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-20 bg-muted rounded animate-pulse" />
                          </CardContent>
                        </Card>
                      }>
                        <SalaryBenchmark data={benchmark} />
                      </Suspense>
                    ) : null}
                  </div>

                  {/* Fit Score - Reframed as growth metric */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <FitScoreCard score={results.fitScore} summary={results.fitSummary} />
                    <MissingSkillsCard skills={results.missingSkills} />
                  </div>
                </section>

                {/* Section 2: Actions (Tools for Next Steps) */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("analysis.sections.actions")}
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Salary Tips - Actionable negotiation guidance */}
                    <div className="lg:col-span-2">
                      <SalaryTipsCard tips={results.salaryNegotiationTips} />
                    </div>
                    
                    {/* Cover Letter - Ready-to-use artifact */}
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
      <footer className="border-t border-border bg-muted/30 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("app.footer")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("app.copyright")}
            </p>
            <a
              href="https://www.linkedin.com/in/mayte-giovanna-hernandez-rios"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: '#0077B5' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0077B5" className="w-4 h-4">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Built by Gio · Connect on LinkedIn
            </a>
          </div>
        </div>
      </footer>

      {/* Onboarding Modal */}
      <OnboardingModal
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onGetStarted={() => {
          // Scroll to first input field
          const firstTextarea = document.querySelector('textarea');
          firstTextarea?.focus();
        }}
      />

      <Toaster />
    </div>
  );
};

export default Index;
