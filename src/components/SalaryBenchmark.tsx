import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, Info } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { BenchmarkResponse } from "@/hooks/useSalaryBenchmark";
import { cn } from "@/lib/utils";

interface SalaryBenchmarkProps {
  data: BenchmarkResponse;
  className?: string;
}

/**
 * SalaryBenchmark Component
 * 
 * Displays INEGI salary benchmark data with gender gap visualization.
 * - Color-coded badge based on gap severity
 * - Visual comparison bars for men/women salaries
 * - Tooltip explaining the gender pay gap
 * - Methodology note with data source
 */
export const SalaryBenchmark = ({ data, className }: SalaryBenchmarkProps) => {
  const { t } = useTranslation();
  
  const {
    ocupacion,
    ocupacion_nombre,
    salario_promedio_hombre,
    salario_promedio_mujer,
    brecha_porcentaje,
    fuente,
    trimestre,
    moneda,
    es_nacional,
    es_cdmx,
    muestra_suficiente,
    isMock
  } = data;

  // Determine gap severity and color
  const getGapSeverity = (gap: number) => {
    if (gap > 15) return { variant: "destructive" as const, label: "Alta" };
    if (gap > 10) return { variant: "destructive" as const, label: "Moderada" };
    if (gap > 5) return { variant: "secondary" as const, label: "Baja" };
    return { variant: "default" as const, label: "Mínima" };
  };

  const severity = getGapSeverity(brecha_porcentaje);

  // Calculate max salary for progress bar scaling
  const maxSalary = Math.max(salario_promedio_hombre, salario_promedio_mujer);
  const hombrePercent = (salario_promedio_hombre / maxSalary) * 100;
  const mujerPercent = (salario_promedio_mujer / maxSalary) * 100;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: moneda || "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!muestra_suficiente && !es_nacional) {
    return (
      <Card className={cn("border-l-4 border-l-muted", className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-muted-foreground" />
            {t("benchmark.title", "Datos Salariales")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("benchmark.noData", "Datos no disponibles para esta ocupación")}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {fuente} · {trimestre}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-l-4", className)} style={{
      borderLeftColor: brecha_porcentaje > 15 ? "hsl(var(--destructive))" : 
                       brecha_porcentaje > 10 ? "hsl(var(--secondary))" : 
                       "hsl(var(--success))"
    }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-xl">💰</span>
            {t("benchmark.title", "Datos Salariales")}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={severity.variant}
              className={cn(
                brecha_porcentaje > 15 && "bg-destructive text-destructive-foreground",
                brecha_porcentaje > 10 && brecha_porcentaje <= 15 && "bg-secondary text-secondary-foreground"
              )}
            >
              {brecha_porcentaje.toFixed(1)}% {t("benchmark.gap", "brecha")}
            </Badge>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">
                    {t("benchmark.whatIsGap", "¿Qué es la brecha salarial?")}
                  </p>
                  <p className="text-sm">
                    {t("benchmark.gapExplanation", 
                      "La brecha salarial de género representa la diferencia porcentual entre el salario promedio de hombres y mujeres en una ocupación específica. Una brecha positiva indica que los hombres ganan más en promedio.")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {ocupacion && ocupacion_nombre && (
          <p className="text-sm text-muted-foreground mt-1">
            {ocupacion_nombre}
            {es_cdmx && " · CDMX"}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Alert for high gap */}
        {brecha_porcentaje > 15 && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">
                {t("benchmark.highGapAlert", "Brecha salarial significativa detectada")}
              </p>
              <p className="text-xs text-destructive/80 mt-0.5">
                {t("benchmark.highGapDescription", 
                  "En esta ocupación, las mujeres ganan considerablemente menos que los hombres en promedio.")}
              </p>
            </div>
          </div>
        )}

        {/* Salary comparison bars */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                👨 {t("benchmark.men", "Hombres")}
              </span>
              <span className="font-medium">{formatCurrency(salario_promedio_hombre)}</span>
            </div>
            <Progress value={hombrePercent} className="h-2" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                👩 {t("benchmark.women", "Mujeres")}
              </span>
              <span className="font-medium">{formatCurrency(salario_promedio_mujer)}</span>
            </div>
            <Progress value={mujerPercent} className="h-2" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-md bg-muted/50">
            <p className="text-xs text-muted-foreground">
              {t("benchmark.difference", "Diferencia")}
            </p>
            <p className={cn(
              "text-lg font-bold",
              brecha_porcentaje > 10 ? "text-destructive" : "text-foreground"
            )}>
              {formatCurrency(salario_promedio_hombre - salario_promedio_mujer)}
            </p>
          </div>
          <div className="p-3 rounded-md bg-muted/50">
            <p className="text-xs text-muted-foreground">
              {t("benchmark.ratio", "Ratio M/H")}
            </p>
            <p className="text-lg font-bold">
              {(salario_promedio_mujer / salario_promedio_hombre * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Methodology note */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {fuente} · {trimestre}
            {isMock && (
              <span className="ml-2 text-amber-600">
                {t("benchmark.mockData", "(Datos de muestra)")}
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("benchmark.methodologyNote", 
              "Datos INEGI ENOE con muestra representativa nacional. Salarios mensuales netos en pesos mexicanos.")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalaryBenchmark;
