
'use client';

import { PlainLanguageAnalysisOutput } from "@/ai/flows/plain-language-analysis";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Smartphone, CheckCircle2, AlertTriangle } from "lucide-react";

type LayoutAndDesignAnalysisProps = {
    layoutAndDesign: PlainLanguageAnalysisOutput['layoutAndDesign'];
};

export default function LayoutAndDesignAnalysis({ layoutAndDesign }: LayoutAndDesignAnalysisProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Layout & Design</CardTitle>
                <CardDescription>Analysis of the site's responsiveness and mobile-friendliness.</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant={layoutAndDesign.hasMobileViewport ? 'default' : 'destructive'} className={layoutAndDesign.hasMobileViewport ? "bg-green-500/10 border-green-500/30" : "bg-destructive/10 border-destructive/30"}>
                    {layoutAndDesign.hasMobileViewport ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                        <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertTitle className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Mobile Viewport
                    </AlertTitle>
                    <AlertDescription>
                       {layoutAndDesign.viewportTagFeedback}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
}
