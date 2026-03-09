import { useState } from "react";
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
import { AlertTriangle } from "lucide-react";

const Index = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [cvText, setCvText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysisResult = await analyzeJobFitWithClaude(jobDescription, cvText);
      setResults(analysisResult);
      setShowResults(true);
      toast({
        title: "¡Análisis completado!",
        description: "Tu análisis de fit laboral está listo.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setError(errorMessage);
      toast({
        title: "Error en el análisis",
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
              <h1 className="text-3xl font-bold text-primary">FairHire</h1>
              <p className="text-sm text-muted-foreground">por Positronica Labs</p>
            </div>
            <Badge variant="secondary" className="hidden md:block">
              Empoderando a mujeres en tech
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!showResults ? (
          /* Input Form */
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Analiza tu fit laboral
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Descubre qué tan bien encajas en un puesto, identifica brechas salariales de género, 
                y obtén herramientas para negociar mejor.
              </p>
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
                    <span className="text-2xl">📋</span>
                    Descripción del Trabajo
                  </CardTitle>
                  <CardDescription>
                    Pega aquí la descripción completa del trabajo al que quieres aplicar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Ejemplo: Buscamos Frontend Developer con experiencia en React, TypeScript, y metodologías ágiles..."
                    className="min-h-[200px] resize-none border-muted focus:border-primary"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </CardContent>
              </Card>

              <Card className="border-2 border-secondary/40 hover:border-secondary/60 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-secondary-foreground">
                    <span className="text-2xl">👩‍💼</span>
                    Tu CV/Currículum
                  </CardTitle>
                  <CardDescription>
                    Pega el texto de tu CV o una descripción de tu experiencia profesional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Ejemplo: Frontend Developer con 3 años de experiencia. Especializada en React, JavaScript, CSS..."
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
                className="px-12 py-3 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                    Analizando...
                  </div>
                ) : (
                  "Analizar Fit y Brecha Salarial"
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Análisis potenciado por IA
              </p>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary mb-2">Análisis Completado</h2>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResults(false);
                  setResults(null);
                  setError(null);
                }}
                className="text-sm"
              >
                ← Nuevo análisis
              </Button>
            </div>

            {results && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <FitScoreCard score={results.fitScore} summary={results.fitSummary} />
                </div>
                <div className="lg:col-span-2">
                  <MissingSkillsCard skills={results.missingSkills} />
                </div>
                <div className="lg:col-span-3">
                  <PayGapCard context={results.payGapContext} />
                </div>
                <div className="lg:col-span-2">
                  <SalaryTipsCard tips={results.salaryNegotiationTips} />
                </div>
                <div className="lg:col-span-1">
                  <CoverLetterCard coverLetter={results.coverLetter} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Hecho con 💜 para cerrar la brecha de género en tech
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 Positronica Labs • FairHire
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
      <Toaster />
    </div>
  );
};

export default Index;
