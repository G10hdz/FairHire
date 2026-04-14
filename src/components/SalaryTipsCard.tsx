import { DollarSign } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface SalaryTipsCardProps {
  tips: string[];
}

export const SalaryTipsCard = ({ tips }: SalaryTipsCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="glass-card p-8 space-y-6">
      <h3 className="font-headline text-xl font-semibold text-foreground flex items-center gap-3">
        <div className="p-2 rounded-full bg-lavender/10">
          <DollarSign className="w-5 h-5 text-lavender-dim" />
        </div>
        {t("analysis.salaryTips.title")}
      </h3>

      <ol className="space-y-6">
        {tips.map((tip, index) => (
          <li key={index} className="flex gap-4 items-start">
            <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="font-orbitron text-xs font-bold text-foreground">
                {index + 1}
              </span>
            </div>
            <p className="text-sm leading-relaxed font-body text-foreground">{tip}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};
