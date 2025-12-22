import { PlainLanguageAnalysisOutput } from '@/ai/flows/plain-language-analysis';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import ScoreIndicator from './score-indicator';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { EyeOff, PictureInPicture, Siren, MousePointerClick } from 'lucide-react';
import { Badge } from '../ui/badge';

type CategoryScoreCardProps = {
  icon: React.ReactNode;
  title: string;
  score: number;
  feedback: string;
  structuralAnalysis?: PlainLanguageAnalysisOutput['structuralAnalysis'];
  visualAnalysis?: PlainLanguageAnalysisOutput['visualAnalysis'];
};

function getScoreColorClass(score: number): string {
  if (score >= 80) return 'bg-score-good';
  if (score >= 60) return 'bg-score-ok';
  return 'bg-score-bad';
}

function renderStructuralFeedback(structuralAnalysis: PlainLanguageAnalysisOutput['structuralAnalysis']) {
    const allIssues = [
        ...structuralAnalysis.headingHierarchyIssues,
        ...structuralAnalysis.listAndBulletIssues,
    ];
    const hasIssues = allIssues.length > 0;
    const headingsFound = Object.entries(structuralAnalysis.headings).flatMap(([level, texts]) =>
        texts.map(text => ({ level: level.toUpperCase(), text }))
    ).filter(h => h.text);

    return (
        <div className="space-y-4">
             <div>
                <h4 className="font-semibold text-sm mb-2">Headings Found</h4>
                {headingsFound.length > 0 ? (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {headingsFound.map((heading, index) => (
                            <li key={index}>
                                <Badge variant="secondary" className="mr-2 text-xs">{heading.level}</Badge>
                                {heading.text}
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-sm text-muted-foreground">No headings found.</p>}
            </div>
            {hasIssues && (
                <div>
                     <h4 className="font-semibold text-sm mb-2 mt-4">Structural Issues</h4>
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                        <Siren className="h-4 w-4" />
                        <AlertTitle>Issues Found</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                {allIssues.map((issue, index) => (
                                    <li key={index}>{issue}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </div>
    );
}

function renderVisualFeedback(visualAnalysis: PlainLanguageAnalysisOutput['visualAnalysis'], feedback: string) {
    const hasAmbiguousIcons = visualAnalysis.ambiguousIcons.length > 0;
    const hasAmbiguousLinks = visualAnalysis.ambiguousLinkText.length > 0;
    const totalImages = visualAnalysis.imagesWithAltText + visualAnalysis.imagesWithoutAltText;
    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-sm mb-2">Alt-Text Statistics</h4>
                {totalImages > 0 ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                           <PictureInPicture className="h-4 w-4 text-score-good" />
                           <div>
                                <span className="font-bold">{visualAnalysis.imagesWithAltText}</span> images with alt-text
                           </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                            <EyeOff className="h-4 w-4 text-score-bad" />
                            <div>
                                <span className="font-bold">{visualAnalysis.imagesWithoutAltText}</span> images missing alt-text
                            </div>
                        </div>
                    </div>
                ) : <p className="text-sm text-muted-foreground">No images found on the page.</p>}
            </div>
            {hasAmbiguousIcons && (
                <div>
                    <h4 className="font-semibold text-sm mb-2 mt-4">Ambiguous Icons</h4>
                     <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                        <Siren className="h-4 w-4" />
                        <AlertTitle>Potentially Confusing Icons</AlertTitle>
                        <AlertDescription>
                           <p>The following icons or pictograms were found without clear text labels, which might confuse users:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                {visualAnalysis.ambiguousIcons.map((icon, index) => (
                                    <li key={index}>{icon}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                </div>
            )}
             {hasAmbiguousLinks && (
                <div>
                    <h4 className="font-semibold text-sm mb-2 mt-4">Ambiguous Link &amp; Button Text</h4>
                     <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                        <MousePointerClick className="h-4 w-4" />
                        <AlertTitle>Vague Calls to Action</AlertTitle>
                        <AlertDescription>
                           <p>The following generic text was found in links or buttons. Consider using more descriptive text.</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {visualAnalysis.ambiguousLinkText.map((text, index) => (
                                    <Badge key={index} variant="destructive" className="bg-destructive/20 text-destructive-foreground border-destructive/30">{text}</Badge>
                                ))}
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )}
             <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">General Feedback</h4>
                <p className="text-sm text-foreground whitespace-pre-wrap">{feedback}</p>
            </div>
        </div>
    )
}

export default function CategoryScoreCard({
  icon,
  title,
  score,
  feedback,
  structuralAnalysis,
  visualAnalysis,
}: CategoryScoreCardProps) {
  const isStructuralCard = title === "Structural Clarity" && structuralAnalysis;
  const isVisualCard = title === "Visual Clarity" && visualAnalysis;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-primary">{icon}</span>
            <CardTitle className="font-headline text-2xl">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-headline">{score}</span>
            <ScoreIndicator score={score} />
          </div>
        </div>
        <Progress
          value={score}
          className="mt-2 h-2"
          indicatorClassName={getScoreColorClass(score)}
        />
      </CardHeader>
      <CardContent className="flex-1">
        <CardDescription>AI-generated feedback and recommendations:</CardDescription>
        <ScrollArea className="mt-4 h-[220px] rounded-md border bg-background/50 p-4">
            {isStructuralCard ? renderStructuralFeedback(structuralAnalysis) 
             : isVisualCard ? renderVisualFeedback(visualAnalysis, feedback)
             : (
                 <p className="text-sm text-foreground whitespace-pre-wrap">{feedback}</p>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
