
'use client';

import { PlainLanguageAnalysisOutput } from '@/ai/flows/plain-language-analysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartConfig, ChartContainer } from '../ui/chart';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import GaugeChart from './gauge-chart';

type VoiceAndToneAnalysisProps = {
  voiceAndTone: PlainLanguageAnalysisOutput['voiceAndTone'];
};

const chartConfig = {
  passive: {
    label: 'Passive',
    color: 'hsl(var(--chart-2))',
  },
  active: {
    label: 'Active',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function VoiceAndToneAnalysis({ voiceAndTone }: VoiceAndToneAnalysisProps) {
  const chartData = [
    { name: 'active', value: voiceAndTone.activeVoicePercentage, fill: chartConfig.active.color },
    { name: 'passive', value: voiceAndTone.passiveVoicePercentage, fill: chartConfig.passive.color },
  ];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Voice & Tone</CardTitle>
        <CardDescription>Analysis of the writing style, voice, and consistency.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="rounded-lg bg-muted/50 p-4 text-center">
            <div className="text-sm text-muted-foreground">Detected Tone</div>
            <div className="text-2xl font-bold font-headline text-primary">{voiceAndTone.tone}</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <GaugeChart 
            value={voiceAndTone.toneConfidence}
            label="Tone Confidence"
            description="AI's confidence in the detected tone."
          />
          <GaugeChart 
            value={voiceAndTone.toneConsistency}
            label="Tone Consistency"
            description="How consistent the tone is across the page."
          />
        </div>
         <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active vs. Passive Voice</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Tooltip
                        content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-1 gap-1 text-center">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    {payload[0].name === 'active' ? 'Active Voice' : 'Passive Voice'}
                                </span>
                                <span className="font-bold">
                                    {payload[0].value}%
                                </span>
                                </div>
                            </div>
                            )
                        }

                        return null
                        }}
                    />
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        labelLine={false}
                    >
                        {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
