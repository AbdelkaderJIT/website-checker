'use client';

import type { PlainLanguageAnalysisOutput } from '@/ai/flows/plain-language-analysis';
import AnalysisForm from '@/components/clarity-grader/analysis-form';
import ReportDisplay from '@/components/clarity-grader/report-display';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2, RotateCw } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PlainLanguageAnalysisOutput | null>(null);

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

  const handleAnalysisStart = () => {
    setIsLoading(true);
    setAnalysisResult(null);
  };

  const handleAnalysisComplete = (result: PlainLanguageAnalysisOutput | null) => {
    setAnalysisResult(result);
    setIsLoading(false);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {isLoading ? (
          <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="font-headline text-2xl font-bold">Analyzing site...</h2>
            <p className="max-w-md text-muted-foreground">
              Our AI is scanning the content, structure, and visuals. This might take a moment.
            </p>
          </div>
        ) : analysisResult ? (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
                Clarity Report
              </h1>
              <Button variant="outline" onClick={handleReset}>
                <RotateCw className="mr-2 h-4 w-4" />
                Analyze Another Site
              </Button>
            </div>
            <ReportDisplay analysis={analysisResult} />
          </div>
        ) : (
          <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  Grade Your Website's Clarity.
                </h1>
                <p className="mt-4 max-w-xl text-lg text-muted-foreground md:text-xl">
                  Enter any URL and our AI will analyze its content, structure, and design against plain
                  language standards. Get a comprehensive report in seconds.
                </p>
                <div className="mt-8 w-full max-w-lg">
                  <AnalysisForm
                    onAnalysisStart={handleAnalysisStart}
                    onAnalysisComplete={handleAnalysisComplete}
                  />
                </div>
              </div>
              <div className="hidden md:block">
                {heroImage && (
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    width={600}
                    height={400}
                    className="rounded-xl shadow-2xl"
                    data-ai-hint={heroImage.imageHint}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Website Checker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
