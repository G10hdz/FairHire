import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface SalaryTipsCardProps {
  tips: string[];
}

export const SalaryTipsCard = ({ tips }: SalaryTipsCardProps) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          {t("analysis.salaryTips.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tips.map((tip, index) => (
          <div key={index} className="flex gap-3 items-start">
            <Badge className="shrink-0 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
              {index + 1}
            </Badge>
            <p className="text-sm leading-relaxed">{tip}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};