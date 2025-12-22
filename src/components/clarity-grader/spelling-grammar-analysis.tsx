
'use client';

import { PlainLanguageAnalysisOutput } from "@/ai/flows/plain-language-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { FileText, SpellCheck } from "lucide-react";

type SpellingGrammarAnalysisProps = {
    spellingAndGrammar: PlainLanguageAnalysisOutput['spellingAndGrammar'];
};

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: number }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

export default function SpellingGrammarAnalysis({ spellingAndGrammar }: SpellingGrammarAnalysisProps) {
    const hasMisspelledWords = spellingAndGrammar.misspelledWords.length > 0;
    const hasGrammarErrors = spellingAndGrammar.grammarErrors.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Spelling & Grammar</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StatCard 
                        icon={<SpellCheck className="h-4 w-4 text-muted-foreground" />}
                        title="Misspelled Words"
                        value={spellingAndGrammar.misspelledWords.length}
                    />
                     <StatCard 
                        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                        title="Grammar Errors"
                        value={spellingAndGrammar.grammarErrors.length}
                    />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Misspelled Words</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {hasMisspelledWords ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Word</TableHead>
                                            <TableHead>Context</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {spellingAndGrammar.misspelledWords.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell><span className="font-mono bg-muted p-1 rounded-md">{item.word}</span></TableCell>
                                                <TableCell className="italic">"{item.context}"</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                               <p className="text-sm text-muted-foreground">No misspelled words found.</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Grammar & Phrasing</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {hasGrammarErrors ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Issue</TableHead>
                                            <TableHead>Context</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {spellingAndGrammar.grammarErrors.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.error}</TableCell>
                                                <TableCell className="italic">"{item.context}"</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No significant grammar issues found.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}
