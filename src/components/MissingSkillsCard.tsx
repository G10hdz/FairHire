import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MissingSkillsCardProps {
  skills: string[];
}

export const MissingSkillsCard = ({ skills }: MissingSkillsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-secondary-foreground">Habilidades a Desarrollar</CardTitle>
        <CardDescription>
          Estas skills te ayudarían a mejorar tu fit para el puesto
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