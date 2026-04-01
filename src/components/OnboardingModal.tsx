import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ClipboardList, FileText, Sparkles, Shield, Info } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGetStarted: () => void;
}

export const OnboardingModal = ({ open, onOpenChange, onGetStarted }: OnboardingModalProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  // Track if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("fairhire-onboarding-seen");
    if (hasSeenOnboarding) {
      onOpenChange(false);
    }
  }, [onOpenChange]);

  const handleSkip = () => {
    localStorage.setItem("fairhire-onboarding-seen", "true");
    onOpenChange(false);
  };

  const handleGetStarted = () => {
    localStorage.setItem("fairhire-onboarding-seen", "true");
    onGetStarted();
    onOpenChange(false);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    // Step 0: Welcome
    {
      icon: <Sparkles className="w-12 h-12 text-primary" />,
      title: t("onboarding.modal.title"),
      description: t("onboarding.modal.subtitle"),
      content: (
        <p className="text-muted-foreground text-center max-w-md">
          {t("onboarding.modal.description")}
        </p>
      ),
    },
    // Step 1: How it works - 3 steps overview
    {
      icon: <ClipboardList className="w-12 h-12 text-primary" />,
      title: t("onboarding.modal.step1.title"),
      description: t("onboarding.modal.step1.description"),
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              1
            </div>
            <div>
              <p className="font-medium">{t("onboarding.modal.step1.title")}</p>
              <p className="text-sm text-muted-foreground">{t("onboarding.modal.step1.description")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              2
            </div>
            <div>
              <p className="font-medium">{t("onboarding.modal.step2.title")}</p>
              <p className="text-sm text-muted-foreground">{t("onboarding.modal.step2.description")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              3
            </div>
            <div>
              <p className="font-medium">{t("onboarding.modal.step3.title")}</p>
              <p className="text-sm text-muted-foreground">{t("onboarding.modal.step3.description")}</p>
            </div>
          </div>
        </div>
      ),
    },
    // Step 2: Fit Score explanation
    {
      icon: <FileText className="w-12 h-12 text-primary" />,
      title: t("onboarding.modal.fitScore.title"),
      description: "",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {t("onboarding.modal.fitScore.explanation")}
          </p>
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">80-100</span>
              <span className="text-sm text-muted-foreground">
                {t("onboarding.modal.fitScore.interpretation.high")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-600">50-79</span>
              <span className="text-sm text-muted-foreground">
                {t("onboarding.modal.fitScore.interpretation.medium")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-600">0-49</span>
              <span className="text-sm text-muted-foreground">
                {t("onboarding.modal.fitScore.interpretation.low")}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">
            {t("onboarding.modal.fitScore.note")}
          </p>
        </div>
      ),
    },
    // Step 3: Data privacy
    {
      icon: <Shield className="w-12 h-12 text-primary" />,
      title: t("onboarding.modal.dataPrivacy.title"),
      description: "",
      content: (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          <Shield className="w-8 h-8 text-primary flex-shrink-0" />
          <p className="text-muted-foreground">
            {t("onboarding.modal.dataPrivacy.description")}
          </p>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">{currentStepData.icon}</div>
          <DialogTitle className="text-2xl">{currentStepData.title}</DialogTitle>
          {currentStepData.description && (
            <DialogDescription className="text-base">
              {currentStepData.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">{currentStepData.content}</div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? "bg-primary"
                  : "bg-muted hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-between pt-4">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            {t("actions.skip")}
          </Button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <Button variant="outline" onClick={handleBack}>
                ← {t("actions.cancel")}
              </Button>
            )}

            {isLastStep ? (
              <Button onClick={handleGetStarted} className="px-6">
                {t("onboarding.modal.cta")}
              </Button>
            ) : (
              <Button onClick={handleNext} className="px-6">
                {t("actions.learnMore")} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
