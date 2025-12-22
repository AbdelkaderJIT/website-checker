
'use client';

import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label, PolarGrid, RadialBar, RadialBarChart } from 'recharts';

function getScoreColor(score: number, variant: 'default' | 'warning'): string {
    if (variant === 'warning') {
        // For plagiarism, higher is worse (bad)
        if (score > 50) return 'hsl(var(--score-bad))';
        if (score > 20) return 'hsl(var(--score-ok))';
        return 'hsl(var(--score-good))';
    }
    // Default is for AI content and scannability, where higher can be good or bad.
    if (score >= 80) return 'hsl(var(--score-good))';
    if (score >= 60) return 'hsl(var(--score-ok))';
    return 'hsl(var(--score-bad))';
}


type GaugeChartProps = {
    value: number;
    label: string;
    description: string;
    variant?: 'default' | 'warning';
};

export default function GaugeChart({ value, label, description, variant = 'default' }: GaugeChartProps) {
  const chartData = [{ name: 'score', value: value, fill: getScoreColor(value, variant) }];
  const chartConfig = {
    score: {
      label: 'Score',
    },
  } satisfies ChartConfig;

  const isPercentage = label.includes("Plagiarism") || label.includes("AI Content");

  return (
    <Card>
        <CardHeader className="items-center pb-0">
            <CardTitle>{label}</CardTitle>
            <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
            <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[200px]"
            >
            <RadialBarChart
                data={chartData}
                startAngle={-90}
                endAngle={90}
                innerRadius="80%"
                outerRadius="110%"
                barSize={20}
                cy="50%"
            >
                <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-muted last:fill-background"
                    polarRadius={[100, 80]}
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
                            className="fill-foreground text-4xl font-bold font-headline"
                        >
                            {value.toFixed(0)}{isPercentage ? "%" : ""}
                        </tspan>
                        </text>
                    );
                    }
                }}
                />
            </RadialBarChart>
            </ChartContainer>
      </CardContent>
    </Card>
  );
}
