import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FitScoreCardProps {
  score: number;
  summary: string;
}

export const FitScoreCard = ({ score, summary }: FitScoreCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-green-600";
    if (score >= 50) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-primary">Fit Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-32 h-32 mx-auto">
          <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <div className="text-muted-foreground text-sm">/ 100</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-4 border-muted" />
            <div 
              className={`absolute w-28 h-28 rounded-full border-4 border-transparent ${getProgressColor(score)}`}
              style={{
                background: `conic-gradient(from 0deg, ${score >= 70 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626'} ${score * 3.6}deg, transparent ${score * 3.6}deg)`
              }}
            />
          </div>
        </div>
        <Progress 
          value={score} 
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
};