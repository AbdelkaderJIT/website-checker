'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Label, PolarGrid, RadialBar, RadialBarChart } from 'recharts';

const chartConfig = {
  score: {
    label: 'Score',
  },
} satisfies ChartConfig;

function getScoreColor(score: number): string {
  if (score >= 80) return 'hsl(var(--score-good))';
  if (score >= 60) return 'hsl(var(--score-ok))';
  return 'hsl(var(--score-bad))';
}

function getScoreDescription(score: number): string {
  if (score >= 90) return 'Excellent. Your content is exceptionally clear and easy to understand.';
  if (score >= 80) return 'Good. Your content is clear with minor areas for improvement.';
  if (score >= 70) return 'Fair. Your content is understandable but could be clearer.';
  if (score >= 60) return 'Needs Work. Your content is somewhat difficult to understand.';
  return 'Poor. Your content is very difficult to understand and needs major revisions.';
}

export default function OverallScoreChart({ score }: { score: number }) {
  const chartData = [{ name: 'score', value: score, fill: getScoreColor(score) }];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-headline">Overall Score</CardTitle>
        <CardDescription>{getScoreDescription(score)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius="70%"
            outerRadius="100%"
            barSize={24}
            cy="55%"
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
            />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-5xl font-bold font-headline"
                      >
                        {`${score.toFixed(0)}%`}
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-center leading-none text-muted-foreground">
          Calculated based on: 50% Text Clarity, 25% Structural Clarity, and 25% Visual Clarity.
        </div>
      </CardFooter>
    </Card>
  );
}
