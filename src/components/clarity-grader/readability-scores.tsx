
'use client';

import { PlainLanguageAnalysisOutput } from "@/ai/flows/plain-language-analysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ReadabilityScoresProps = {
    scores: PlainLanguageAnalysisOutput['readabilityScores'];
};

export default function ReadabilityScores({ scores }: ReadabilityScoresProps) {
    const data = [
        { name: 'Flesch Reading Ease', score: scores.fleschReadingEase, range: '0-100 (higher is better)' },
        { name: 'Flesch-Kincaid Grade', score: scores.fleschKincaidGrade, range: 'Lower is better' },
        { name: 'Gunning Fog Index', score: scores.gunningFogIndex, range: 'Lower is better' },
    ];
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Readability Scores</CardTitle>
                <CardDescription>Standard metrics for content readability.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data} layout="vertical" margin={{ left: 30, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} tickLine={false} axisLine={false} />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const range = data.find(d => d.name === label)?.range;
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <p className="font-bold">{label}</p>
                                            <p className="text-sm">Score: {payload[0].value}</p>
                                            <p className="text-xs text-muted-foreground">{range}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend />
                        <Bar dataKey="score" fill="hsl(var(--primary))" barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
