
'use client';

import { PlainLanguageAnalysisOutput } from "@/ai/flows/plain-language-analysis";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Lightbulb, Repeat, BookA, Speaker } from "lucide-react";
import RepetitiveWords from "./repetitive-words";

type VocabularyAnalysisProps = {
    vocabulary: PlainLanguageAnalysisOutput['vocabulary'];
    sentenceAnalysis: PlainLanguageAnalysisOutput['sentenceAnalysis'];
};

function StatItem({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-semibold">{value}</dd>
        </div>
    )
}

function WordList({ title, icon, words }: { title: string, icon: React.ReactNode, words: string[] }) {
    return (
        <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><span className="text-primary">{icon}</span> {title}</h4>
            {words.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {words.map((word, index) => (
                        <Badge key={index} variant="secondary">{word}</Badge>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">None found.</p>
            )}
        </div>
    )
}

export default function VocabularyAnalysis({ vocabulary, sentenceAnalysis }: VocabularyAnalysisProps) {
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Vocabulary & Sentence Structure</CardTitle>
                <CardDescription>Analysis of word choice and sentence complexity.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                 <dl className="space-y-2">
                   <StatItem label="Long Sentences (>20 words)" value={sentenceAnalysis.longSentenceCount} />
                   <StatItem label="Hard Words (≥3 syllables)" value={sentenceAnalysis.complexWordCount} />
                </dl>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <span className="text-primary"><Lightbulb className="h-4 w-4" /></span>
                            Detected Jargon
                        </h4>
                        {vocabulary.jargon.length > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {vocabulary.jargon.map((item, index) => (
                                    <li key={index} className="flex items-start justify-between gap-4 p-2 rounded-md bg-muted/50">
                                        <span className="font-semibold">{item.word}</span>
                                        <span className="text-right text-muted-foreground">
                                            <span className="font-medium text-foreground">Suggestion:</span> {item.suggestion}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">None found.</p>
                        )}
                    </div>
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <WordList title="Acronyms" icon={<BookA className="h-4 w-4"/>} words={vocabulary.acronyms} />
                        <RepetitiveWords title="Repetitive Words" icon={<Speaker className="h-4 w-4" />} words={vocabulary.repetitiveWords} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
