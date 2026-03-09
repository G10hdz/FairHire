import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  const [apiKey, setApiKey] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [cvText, setCvText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key requerida",
        description: "Por favor ingresa tu API key de Anthropic.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysisResult = await analyzeJobFitWithClaude(jobDescription, cvText, apiKey);
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

  // Mock data for initial layout
  const mockResults = {
    fitScore: 87,
    fitSummary: "Excelente ajuste para el puesto. Tienes experiencia sólida en la mayoría de las áreas requeridas.",
    missingSkills: ["React Native", "GraphQL", "Docker"],
    payGapContext: "En México, las mujeres en roles de Frontend Developer ganan en promedio 15-20% menos que sus contrapartes masculinos. El rango salarial para este puesto debería estar entre $45,000 - $65,000 MXN mensuales.",
    salaryNegotiationTips: [
      "Enfatiza tu experiencia específica en React y TypeScript",
      "Menciona proyectos exitosos donde hayas liderado implementaciones",
      "Solicita una revisión salarial a los 6 meses con métricas claras"
    ],
    coverLetter: "Estimado equipo de contratación,\n\nMe emociona la oportunidad de contribuir como Frontend Developer. Mi experiencia de 4 años en React y mi pasión por crear interfaces accesibles me posicionan perfectamente para este rol...\n\n[Carta completa aquí]"
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

            {/* API Key Input */}
            <Card className="border-2 border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-accent-foreground flex items-center gap-2">
                  <span className="text-2xl">🔐</span>
                  API Key de Anthropic
                </CardTitle>
                <CardDescription>
                  Ingresa tu API key de Anthropic para usar Claude. Puedes obtener una en{" "}
                  <a 
                    href="https://console.anthropic.com/account/keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    console.anthropic.com
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Tu API Key (se mantiene privada en tu navegador)</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-ant-api03-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </CardContent>
            </Card>

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
                disabled={!apiKey.trim() || !jobDescription.trim() || !cvText.trim() || isAnalyzing}
                className="px-12 py-3 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                    Analizando con Claude...
                  </div>
                ) : (
                  "Analizar Fit y Brecha Salarial"
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Análisis potenciado por Claude • Tu API key se mantiene privada
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
                {/* Fit Score */}
                <div className="lg:col-span-1">
                  <FitScoreCard score={results.fitScore} summary={results.fitSummary} />
                </div>

                {/* Missing Skills */}
                <div className="lg:col-span-2">
                  <MissingSkillsCard skills={results.missingSkills} />
                </div>

                {/* Pay Gap Context */}
                <div className="lg:col-span-3">
                  <PayGapCard context={results.payGapContext} />
                </div>

                {/* Salary Negotiation Tips */}
                <div className="lg:col-span-2">
                  <SalaryTipsCard tips={results.salaryNegotiationTips} />
                </div>

                {/* Cover Letter */}
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
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Hecho con 💜 para cerrar la brecha de género en tech
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 Positronica Labs • FairHire
            </p>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default Index;