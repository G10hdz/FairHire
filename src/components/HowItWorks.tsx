import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ClipboardList, FileText, Sparkles, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export const HowItWorks = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className="w-full px-8 py-5 flex items-center justify-between gap-4 hover:bg-lavender/5 transition-colors rounded-[1.5rem]"
            aria-expanded={isOpen}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-lavender/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-lavender-dim" />
              </div>
              <div className="text-left">
                <h3 className="font-headline font-semibold text-foreground">
                  {t("onboarding.howItWorks.title")}
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  {t("onboarding.howItWorks.subtitle")}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-8 pb-8">
            <div className="grid md:grid-cols-3 gap-6 mt-2">
              <div className="flex flex-col items-center text-center p-6 bg-surface-container-low/50 rounded-lg border border-lavender/10">
                <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                  <ClipboardList className="w-7 h-7 text-foreground" />
                </div>
                <h4 className="font-headline font-medium mb-2 text-foreground">{t("onboarding.howItWorks.step1.title")}</h4>
                <p className="text-sm text-muted-foreground font-body">
                  {t("onboarding.howItWorks.step1.description")}
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-surface-container-low/50 rounded-lg border border-lavender/10">
                <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-foreground" />
                </div>
                <h4 className="font-headline font-medium mb-2 text-foreground">{t("onboarding.howItWorks.step2.title")}</h4>
                <p className="text-sm text-muted-foreground font-body">
                  {t("onboarding.howItWorks.step2.description")}
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-surface-container-low/50 rounded-lg border border-lavender/10">
                <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-foreground" />
                </div>
                <h4 className="font-headline font-medium mb-2 text-foreground">{t("onboarding.howItWorks.step3.title")}</h4>
                <p className="text-sm text-muted-foreground font-body">
                  {t("onboarding.howItWorks.step3.description")}
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="ghost-border text-lavender-dim hover:bg-lavender/5 rounded-sm gap-2"
              >
                <X className="w-4 h-4" />
                {t("onboarding.howItWorks.close")}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
