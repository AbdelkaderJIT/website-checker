
'use client';

import { PlainLanguageAnalysisOutput } from "@/ai/flows/plain-language-analysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Progress } from "../ui/progress";

type PlainLanguagePrinciplesProps = {
    principles: PlainLanguageAnalysisOutput['plainLanguagePrinciples'];
};

function getScoreColorClass(score: number): string {
  if (score >= 80) return 'bg-score-good';
  if (score >= 60) return 'bg-score-ok';
  return 'bg-score-bad';
}


export default function PlainLanguagePrinciples({ principles }: PlainLanguagePrinciplesProps) {
    if (!principles || principles.length === 0) {
        return null;
    }
    
    const principlesMet = principles.filter(p => p.isMet).length;
    const totalPrinciples = principles.length;
    const percentageMet = totalPrinciples > 0 ? (principlesMet / totalPrinciples) * 100 : 0;
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Plain Language Principles Checklist</CardTitle>
                <CardDescription>
                    Evaluation against core plain language guidelines. 
                    <span className="font-bold"> ({principlesMet} of {totalPrinciples} criteria met)</span>
                </CardDescription>
                <Progress
                    value={percentageMet}
                    className="mt-2 h-2"
                    indicatorClassName={getScoreColorClass(percentageMet)}
                />
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {principles.map((principle, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-3 text-left">
                                    {principle.isMet ? (
                                        <CheckCircle2 className="h-5 w-5 text-score-good flex-shrink-0" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-score-bad flex-shrink-0" />
                                    )}
                                    <span className="font-medium">{principle.name}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-8 text-muted-foreground">
                                {principle.reasoning}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    )
}
