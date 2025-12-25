import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import ScoreIndicator from './score-indicator';

type CategoryScoreCardProps = {
  icon: React.ReactNode;
  title: string;
  score: number;
  feedback: string;
};

function getScoreColorClass(score: number): string {
  if (score >= 80) return 'bg-score-good';
  if (score >= 60) return 'bg-score-ok';
  return 'bg-score-bad';
}

export default function CategoryScoreCard({
  icon,
  title,
  score,
  feedback,
}: CategoryScoreCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-primary">{icon}</span>
            <CardTitle className="font-headline text-2xl">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-headline">{score}</span>
            <ScoreIndicator score={score} />
          </div>
        </div>
        <Progress
          value={score}
          className="mt-2 h-2"
          indicatorClassName={getScoreColorClass(score)}
        />
      </CardHeader>
      <CardContent className="flex-1">
        <CardDescription>Retour et recommandations générés par l'IA :</CardDescription>
        <ScrollArea className="mt-4 h-[220px] rounded-md border bg-background/50 p-4">
          <p className="text-sm text-foreground whitespace-pre-wrap">{feedback}</p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
