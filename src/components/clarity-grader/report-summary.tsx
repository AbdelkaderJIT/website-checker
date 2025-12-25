import type { PlainLanguageAnalysisOutput } from '@/ai/flows/plain-language-analysis';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookText,
  Clock,
  Heading,
  Image as ImageIcon,
  List,
  Percent,
  Ruler,
  BookOpen,
  Book,
  Scale,
} from 'lucide-react';

type SummaryItemProps = {
  icon: React.ReactNode;
  value: string | number;
  label: string;
};

function SummaryItem({ icon, value, label }: SummaryItemProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-muted/50 p-4 text-center">
      <div className="text-primary">{icon}</div>
      <div className="text-2xl font-bold font-headline">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export default function ReportSummary({ analysis }: { analysis: PlainLanguageAnalysisOutput }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-8">
          <SummaryItem
            icon={<Ruler className="h-6 w-6" />}
            value={analysis.readabilityGradeLevel}
            label="Niveau de lecture"
          />
          <SummaryItem
            icon={<BookOpen className="h-6 w-6" />}
            value={analysis.totalWords}
            label="Mots"
          />
          <SummaryItem
            icon={<BookText className="h-6 w-6" />}
            value={analysis.totalSentences}
            label="Phrases"
          />
           <SummaryItem
            icon={<Scale className="h-6 w-6" />}
            value={analysis.averageSentenceLength}
            label="Moy. phrase"
          />
          <SummaryItem
            icon={<Book className="h-6 w-6" />}
            value={analysis.totalParagraphs}
            label="Paragraphes"
          />
          <SummaryItem
            icon={<ImageIcon className="h-6 w-6" />}
            value={analysis.totalImages}
            label="Images"
          />
          <SummaryItem
            icon={<Heading className="h-6 w-6" />}
            value={analysis.totalHeadings}
            label="Titres"
          />
          <SummaryItem
            icon={<Clock className="h-6 w-6" />}
            value={analysis.estimatedReadingTime}
            label="Temps de lecture"
          />
        </div>
      </CardContent>
    </Card>
  );
}
