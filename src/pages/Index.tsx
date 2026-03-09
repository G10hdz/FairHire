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

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // TODO: Implement Claude API call
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
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
                Análisis gratuito • Resultados en segundos • Sin registro requerido
              </p>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary mb-2">Análisis Completado</h2>
              <Button
                variant="outline"
                onClick={() => setShowResults(false)}
                className="text-sm"
              >
                ← Nuevo análisis
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Fit Score */}
              <Card className="lg:col-span-1">
                <CardHeader className="text-center">
                  <CardTitle className="text-primary">Fit Score</CardTitle>
                  <div className="text-6xl font-bold text-primary mt-4">
                    {mockResults.fitScore}
                  </div>
                  <div className="text-muted-foreground">/ 100</div>
                </CardHeader>
                <CardContent>
                  <Progress value={mockResults.fitScore} className="mb-4" />
                  <p className="text-sm text-center">{mockResults.fitSummary}</p>
                </CardContent>
              </Card>

              {/* Missing Skills */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-secondary-foreground">Habilidades a Desarrollar</CardTitle>
                  <CardDescription>
                    Estas skills te ayudarían a mejorar tu fit para el puesto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mockResults.missingSkills.map((skill) => (
                      <Badge key={skill} variant="outline" className="border-secondary text-secondary-foreground">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pay Gap Context */}
              <Card className="lg:col-span-3 border-l-4 border-l-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive-foreground">Contexto de Brecha Salarial</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{mockResults.payGapContext}</p>
                </CardContent>
              </Card>

              {/* Salary Negotiation Tips */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-primary">Tips de Negociación Salarial</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockResults.salaryNegotiationTips.map((tip, index) => (
                    <div key={index} className="flex gap-3">
                      <Badge className="shrink-0 w-6 h-6 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Cover Letter */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-accent-foreground">Carta Personalizada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea
                      readOnly
                      value={mockResults.coverLetter}
                      className="min-h-[200px] text-sm"
                    />
                    <Button
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => navigator.clipboard.writeText(mockResults.coverLetter)}
                    >
                      Copiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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
    </div>
  );
};

export default Index;