import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

type ScoreIndicatorProps = {
  score: number;
};

export default function ScoreIndicator({ score }: ScoreIndicatorProps) {
  if (score >= 80) {
    return <CheckCircle2 className="h-6 w-6 text-score-good" aria-label="Good score" />;
  }
  if (score >= 60) {
    return <AlertTriangle className="h-6 w-6 text-score-ok" aria-label="Average score" />;
  }
  return <XCircle className="h-6 w-6 text-score-bad" aria-label="Poor score" />;
}
