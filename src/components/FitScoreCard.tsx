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
        color: "text-[#3A644C]",
        gradientColor: "#3A644C",
        icon: CheckCircle,
        label: t("analysis.fitScore.goodFit"),
      };
    }
    if (score >= 50) {
      return {
        color: "text-yellow-600",
        gradientColor: "#D4A017",
        icon: AlertCircle,
        label: t("analysis.fitScore.fairFit"),
      };
    }
    return {
      color: "text-red-600",
      gradientColor: "#B41340",
      icon: XCircle,
      label: t("analysis.fitScore.needsImprovement"),
    };
  };

  const scoreInfo = getScoreInfo(score);
  const ScoreIcon = scoreInfo.icon;

  return (
    <div className="glass-card p-8 text-center space-y-6">
      <h3 className="font-headline text-xl font-semibold text-foreground flex items-center justify-center gap-2">
        {t("analysis.fitScore.title")}
        <ScoreIcon className={`w-5 h-5 ${scoreInfo.color}`} />
      </h3>

      {/* Circular Dial */}
      <div className="relative w-48 h-48 mx-auto" role="img" aria-label={`Fit Score: ${score} de 100`}>
        {/* Outer ring background */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, #B41340 0deg, #D4A017 120deg, #3A644C 240deg, transparent 360deg)`,
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 12px), #000 calc(100% - 12px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 12px), #000 calc(100% - 12px))',
          }}
        />
        {/* Progress overlay */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, #B41340 0deg, #D4A017 120deg, #3A644C 240deg, hsl(var(--surface-container-lowest)) ${score * 3.6}deg, transparent ${score * 3.6}deg)`,
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 12px), #000 calc(100% - 12px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 12px), #000 calc(100% - 12px))',
          }}
        />
        {/* Inner circle */}
        <div className="absolute inset-6 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm border border-lavender/15 flex flex-col items-center justify-center">
          <span className={`font-orbitron text-5xl font-bold ${scoreInfo.color}`}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground font-orbitron tracking-wider mt-1">/ 100</span>
        </div>
      </div>

      {/* Label */}
      <p className={`font-headline text-lg font-semibold ${scoreInfo.color}`}>
        {scoreInfo.label}
      </p>

      {/* Linear Progress */}
      <Progress
        value={score}
        className="w-full"
        aria-label={`Progreso: ${score}%`}
      />

      {/* AI Summary */}
      <p className="text-sm text-muted-foreground font-body leading-relaxed">
        {summary}
      </p>
    </div>
  );
};
