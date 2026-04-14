import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface PayGapCardProps {
  context: string;
}

export const PayGapCard = ({ context }: PayGapCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="glass-card p-8 pink-alert">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-pink-biological/10">
          <AlertTriangle className="w-5 h-5 text-pink-biological" />
        </div>
        <div className="space-y-3 flex-1">
          <h3 className="font-headline text-xl font-semibold text-foreground">
            {t("analysis.payGap.title")}
          </h3>
          <p className="font-body text-muted-foreground leading-relaxed">
            {context}
          </p>
        </div>
      </div>
    </div>
  );
};
