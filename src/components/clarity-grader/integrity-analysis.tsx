
'use client';

import { PlainLanguageAnalysisOutput } from "@/ai/flows/plain-language-analysis";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Copy, ShieldAlert } from "lucide-react";
import GaugeChart from "./gauge-chart";
import { ScrollArea } from "../ui/scroll-area";

type IntegrityAnalysisProps = {
    integrity: PlainLanguageAnalysisOutput['integrity'];
}

export default function IntegrityAnalysis({ integrity }: IntegrityAnalysisProps) {
    const hasBiasWarnings = integrity.biasAndInclusivityWarnings.length > 0;
    const hasRedundancy = integrity.internalRedundancy.length > 0;

  return (
    <Card className="lg:col-span-3">
        <CardHeader>
            <CardTitle>Content Integrity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
               <GaugeChart
                    value={integrity.aiGeneratedContentPercentage}
                    label="AI Content Probability"
                    description="Likelihood that the content was written by an AI."
                />
                 <GaugeChart
                    value={integrity.plagiarismPercentage}
                    label="Plagiarism Detected"
                    description="Percentage of content matching public web sources."
                    variant="warning"
                />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                 {hasBiasWarnings && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5" />
                                Bias & Inclusivity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Alert variant="destructive">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertTitle>Potential Issues Found</AlertTitle>
                                <AlertDescription>
                                    <p className="mb-2">The following potentially biased or non-inclusive language was detected:</p>
                                    <ul className="mt-2 list-disc space-y-1 pl-5">
                                        {integrity.biasAndInclusivityWarnings.map((warning, index) => (
                                            <li key={index}>{warning}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                )}
                 {hasRedundancy && (
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Copy className="h-5 w-5" />
                                Internal Redundancy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-sm text-muted-foreground mb-2">The following content appears multiple times on the site or is semantically redundant.</p>
                            <ScrollArea className="h-[150px] rounded-md border bg-background/50 p-3">
                                <ul className="space-y-2">
                                    {integrity.internalRedundancy.map((item, index) => (
                                        <li key={index} className="text-sm italic border-l-2 pl-3">"{item}"</li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}
            </div>
        </CardContent>
    </Card>
  );
}

    