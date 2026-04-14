import { useTranslation } from "@/hooks/useTranslation";

interface MissingSkillsCardProps {
  skills: string[];
}

export const MissingSkillsCard = ({ skills }: MissingSkillsCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="glass-card p-8 space-y-6">
      <div className="space-y-2">
        <h3 className="font-headline text-xl font-semibold text-foreground">
          {t("analysis.missingSkills.title")}
        </h3>
        <p className="text-sm text-muted-foreground font-body">
          {t("analysis.missingSkills.description")}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="skill-badge px-4 py-2 text-sm font-body"
          >
            {skill}
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground italic font-body">
            {t("analysis.missingSkills.noMissing")}
          </p>
        )}
      </div>
    </div>
  );
};
