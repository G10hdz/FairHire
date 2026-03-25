import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface PayGapCardProps {
  context: string;
}

export const PayGapCard = ({ context }: PayGapCardProps) => {
  const { t } = useTranslation();
  return (
    <Card className="border-l-4 border-l-destructive">
      <CardHeader>
        <CardTitle className="text-destructive-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {t("analysis.payGap.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="border-destructive/20">
          <AlertDescription className="leading-relaxed">
            {context}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};