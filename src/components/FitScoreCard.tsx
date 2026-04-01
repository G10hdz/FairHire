import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/useTranslation";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface FitScoreCardProps {
  score: number;
  summary: string;
}

export const FitScoreCard = ({ score, summary }: FitScoreCardProps) => {
  const { t } = useTranslation();
  
  const getScoreInfo = (score: number) => {
    if (score >= 70) {
      return {
        color: "text-green-600",
        progressColor: "bg-green-600",
        icon: CheckCircle,
        label: "Excelente",
      };
    }
    if (score >= 50) {
      return {
        color: "text-yellow-600",
        progressColor: "bg-yellow-600",
        icon: AlertCircle,
        label: "Bueno",
      };
    }
    return {
      color: "text-red-600",
      progressColor: "bg-red-600",
      icon: XCircle,
      label: "Por mejorar",
    };
  };

  const scoreInfo = getScoreInfo(score);
  const ScoreIcon = scoreInfo.icon;

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-primary flex items-center justify-center gap-2">
          {t("analysis.fitScore.title")}
          <ScoreIcon className={`w-5 h-5 ${scoreInfo.color}`} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center" role="img" aria-label={`Fit Score: ${score} de 100 - ${scoreInfo.label}`}>
          <div className="absolute inset-0">
            <div className="w-40 h-40 rounded-full border-4 border-muted" />
            <div
              className="absolute inset-0 w-40 h-40 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, ${scoreInfo.progressColor.replace('bg-', 'text-').replace('600', '600')} ${score * 3.6}deg, transparent ${score * 3.6}deg)`,
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
              }}
            />
          </div>
          <div className="relative z-10 text-center">
            <div className={`text-4xl font-bold ${scoreInfo.color}`}>
              {score}
            </div>
            <div className="text-muted-foreground text-xs">/ 100</div>
          </div>
        </div>
        <Progress
          value={score}
          className="w-full"
          aria-label={`Progreso: ${score}%`}
        />
        <p className="text-sm text-muted-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
};