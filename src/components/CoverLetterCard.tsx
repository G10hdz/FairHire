import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, FileText } from "lucide-react";
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
    <div className="glass-card p-8 space-y-6">
      <h3 className="font-headline text-xl font-semibold text-foreground flex items-center gap-3">
        <div className="p-2 rounded-full bg-lavender/10">
          <FileText className="w-5 h-5 text-lavender-dim" />
        </div>
        {t("analysis.coverLetter.title")}
      </h3>

      <div className="relative">
        <div className="min-h-[250px] text-sm leading-relaxed font-body text-muted-foreground bg-surface-container-low/50 rounded-lg p-4 border border-lavender/10 whitespace-pre-wrap">
          {coverLetter}
        </div>
        <Button
          size="sm"
          onClick={handleCopy}
          className="absolute top-3 right-3 rounded-sm transition-all bg-gradient-primary text-foreground hover:opacity-90 hover:-translate-y-0.5"
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
    </div>
  );
};
