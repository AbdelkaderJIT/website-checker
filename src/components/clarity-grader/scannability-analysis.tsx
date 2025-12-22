
'use client';

import { PlainLanguageAnalysisOutput } from "@/ai/flows/plain-language-analysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Newspaper, ScrollText, FileWarning, Link2Off } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import GaugeChart from "./gauge-chart";

type ScannabilityAnalysisProps = {
    scannability: PlainLanguageAnalysisOutput['scannability'];
};

export default function ScannabilityAnalysis({ scannability }: ScannabilityAnalysisProps) {
    const hasTextWalls = scannability.textWalls.length > 0;
    const hasMismatches = scannability.headingContentMismatch.length > 0;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Scannability & Flow</CardTitle>
                <CardDescription>Analysis of how easily a user can scan and understand the content.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <GaugeChart
                        value={scannability.paragraphLengthScore}
                        label="Scannability Score"
                        description="Computed from average paragraph length. Shorter paragraphs result in a higher score."
                        variant="default"
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><Newspaper className="h-5 w-5" /> Logical Flow & Key Message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{scannability.logicalFlowFeedback}</p>
                        </CardContent>
                    </Card>
                </div>
                
                {hasMismatches && (
                    <div>
                        <Alert variant="destructive">
                            <Link2Off className="h-4 w-4" />
                            <AlertTitle>Heading-Content Mismatches Found</AlertTitle>
                            <AlertDescription>
                                <p className="mb-2">The AI detected that the content under the following headings may not be relevant to the heading itself:</p>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                    {scannability.headingContentMismatch.map((mismatch, index) => (
                                        <li key={index}>{mismatch}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {hasTextWalls && (
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><FileWarning className="h-5 w-5 text-destructive" /> "Walls of Text" Detected</h3>
                        <p className="text-sm text-muted-foreground mb-2">The following paragraphs are too long and should be broken up for better readability:</p>
                        <ScrollArea className="h-[200px] rounded-md border bg-background/50 p-3">
                            <ul className="space-y-4">
                                {scannability.textWalls.map((wall, index) => (
                                    <li key={index} className="text-sm border-l-2 pl-3">
                                        <p className="italic">"{wall.text}"</p>
                                        <p className="mt-2 text-primary/80"><span className="font-semibold">Summary:</span> {wall.summary}</p>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

