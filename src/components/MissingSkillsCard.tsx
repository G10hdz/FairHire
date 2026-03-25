import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

interface MissingSkillsCardProps {
  skills: string[];
}

export const MissingSkillsCard = ({ skills }: MissingSkillsCardProps) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-secondary-foreground">{t("analysis.missingSkills.title")}</CardTitle>
        <CardDescription>
          {t("analysis.missingSkills.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="border-secondary text-secondary-foreground hover:bg-secondary/10"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};