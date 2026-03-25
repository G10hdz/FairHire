import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface CoverLetterCardProps {
  coverLetter: string;
}

export const CoverLetterCard = ({ coverLetter }: CoverLetterCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      toast({
        title: t("messages.copiedSuccess"),
        description: t("messages.copiedDesc"),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: t("messages.copyError"),
        description: t("messages.copyErrorDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-accent-foreground">{t("analysis.coverLetter.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            readOnly
            value={coverLetter}
            className="min-h-[200px] text-sm leading-relaxed"
          />
          <Button
            size="sm"
            onClick={handleCopy}
            className="absolute top-2 right-2"
            variant={copied ? "secondary" : "default"}
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                {t("actions.copied")}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                {t("actions.copy")}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};