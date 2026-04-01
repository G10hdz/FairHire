import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ClipboardList, FileText, Sparkles, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export const HowItWorks = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-dashed">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className="w-full px-6 py-4 flex items-center justify-between gap-4"
            aria-expanded={isOpen}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">
                  {t("onboarding.howItWorks.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("onboarding.howItWorks.subtitle")}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          <CardContent className="pt-0 pb-6">
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <ClipboardList className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">{t("onboarding.howItWorks.step1.title")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("onboarding.howItWorks.step1.description")}
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">{t("onboarding.howItWorks.step2.title")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("onboarding.howItWorks.step2.description")}
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">{t("onboarding.howItWorks.step3.title")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("onboarding.howItWorks.step3.description")}
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                {t("onboarding.howItWorks.close")}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
