
'use client';

import { PlainLanguageAnalysisOutput } from '@/ai/flows/plain-language-analysis';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, CheckCircle2, Target, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReadabilityBenchmarkProps = {
  analysis: PlainLanguageAnalysisOutput;
};

type BenchmarkRow = {
  metric: string;
  yourScore: string | number;
  ideal: string;
  isGood: (score: number) => boolean;
  isWarning: (score: number) => boolean;
};

function getNumericGrade(grade: string): number {
    const match = grade.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
}

export default function ReadabilityBenchmark({ analysis }: ReadabilityBenchmarkProps) {
  const yourGrade = getNumericGrade(analysis.readabilityGradeLevel);
  const yourSentenceLength = analysis.averageSentenceLength;
  const yourFleschEase = analysis.readabilityScores.fleschReadingEase;
  
  const benchmarks: BenchmarkRow[] = [
    {
      metric: 'Grade Level',
      yourScore: yourGrade,
      ideal: '8 - 10',
      isGood: (score) => score <= 10,
      isWarning: (score) => score > 10 && score <= 12,
    },
    {
      metric: 'Avg. Sentence Length',
      yourScore: yourSentenceLength.toFixed(1),
      ideal: '< 17 words',
      isGood: (score) => score < 17,
      isWarning: (score) => score >= 17 && score <= 20,
    },
    {
      metric: 'Flesch Reading Ease',
      yourScore: yourFleschEase.toFixed(0),
      ideal: '> 60',
      isGood: (score) => score > 60,
      isWarning: (score) => score <= 60 && score > 50,
    },
  ];

  const getStatusIcon = (row: BenchmarkRow, score: number) => {
    if (row.isGood(score)) {
      return <CheckCircle2 className="h-5 w-5 text-score-good" />;
    }
    if (row.isWarning(score)) {
      return <AlertTriangle className="h-5 w-5 text-score-ok" />;
    }
    return <XCircle className="h-5 w-5 text-score-bad" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Readability Benchmark</CardTitle>
        <CardDescription>
          How your content compares to recommended plain language standards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-center">Your Score</TableHead>
              <TableHead className="text-center">Ideal</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {benchmarks.map((row) => {
              const scoreValue = typeof row.yourScore === 'string' ? parseFloat(row.yourScore) : row.yourScore;
              return (
                <TableRow key={row.metric}>
                  <TableCell className="font-medium">{row.metric}</TableCell>
                  <TableCell className={cn(
                    "text-center font-bold font-headline text-lg",
                    row.isGood(scoreValue) ? 'text-score-good' : row.isWarning(scoreValue) ? 'text-score-ok' : 'text-score-bad'
                  )}>{row.yourScore}</TableCell>
                  <TableCell className="text-center font-mono">{row.ideal}</TableCell>
                  <TableCell className="flex justify-end">{getStatusIcon(row, scoreValue)}</TableCell>
                </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
