
import type { PlainLanguageAnalysisOutput } from '@/ai/flows/plain-language-analysis';
import CategoryScoreCard from './category-score-card';
import OverallScoreChart from './overall-score-chart';
import { ClipboardCheck, Combine, Image as ImageIcon, CheckCircle, BarChartHorizontal, ShieldCheck, Globe, List, ThumbsUp } from 'lucide-react';
import ReportSummary from './report-summary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IntegrityAnalysis from './integrity-analysis';
import ReadabilityScores from './readability-scores';
import VocabularyAnalysis from './vocabulary-analysis';
import VoiceAndToneAnalysis from './voice-and-tone-analysis';
import ScannabilityAnalysis from './scannability-analysis';
import LayoutAndDesignAnalysis from './layout-and-design-analysis';
import PlainLanguagePrinciples from './plain-language-principles';
import ReadabilityBenchmark from './readability-benchmark';

type ReportDisplayProps = {
  analysis: PlainLanguageAnalysisOutput;
};

export default function ReportDisplay({ analysis }: ReportDisplayProps) {
  return (
    <div className="space-y-8">
      <OverallScoreChart score={analysis.overallScore} />
      
      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="summary">
            <BarChartHorizontal className="mr-2 h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="principles">
            <ThumbsUp className="mr-2 h-4 w-4" />
            Plain Language Principles
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <List className="mr-2 h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            <CheckCircle className="mr-2 h-4 w-4" />
            Clarity Breakdown
          </TabsTrigger>
          <TabsTrigger value="integrity">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Integrity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
                <ScannabilityAnalysis scannability={analysis.scannability} />
            </div>
        </TabsContent>

        <TabsContent value="principles" className="mt-6">
          <PlainLanguagePrinciples principles={analysis.plainLanguagePrinciples} />
        </TabsContent>

        <TabsContent value="statistics" className="mt-6 space-y-6">
          <ReportSummary analysis={analysis} />
          <ReadabilityBenchmark analysis={analysis} />
           <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ReadabilityScores scores={analysis.readabilityScores} />
                <VoiceAndToneAnalysis voiceAndTone={analysis.voiceAndTone} />
            </div>
        </TabsContent>

        <TabsContent value="breakdown" className="mt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CategoryScoreCard
              icon={<ClipboardCheck className="h-6 w-6" />}
              title="Text Clarity"
              score={analysis.textClarityScore}
              feedback={analysis.textClarityFeedback}
            />
            <CategoryScoreCard
              icon={<Combine className="h-6 w-6" />}
              title="Structural Clarity"
              score={analysis.structureClarityScore}
              feedback={analysis.structureClarityFeedback}
              structuralAnalysis={analysis.structuralAnalysis}
            />
            <CategoryScoreCard
              icon={<ImageIcon className="h-6 w-6" />}
              title="Visual Clarity"
              score={analysis.visualClarityScore}
              feedback={analysis.visualClarityFeedback}
              visualAnalysis={analysis.visualAnalysis}
            />
            <CategoryScoreCard
              icon={<Globe className="h-6 w-6" />}
              title="Non-Native Readability"
              score={analysis.nonNativeReadability.score}
              feedback={analysis.nonNativeReadability.feedback}
            />
            <VocabularyAnalysis 
              vocabulary={analysis.vocabulary}
              sentenceAnalysis={analysis.sentenceAnalysis}
            />
             <LayoutAndDesignAnalysis layoutAndDesign={analysis.layoutAndDesign} />
             <VoiceAndToneAnalysis voiceAndTone={analysis.voiceAndTone} />
          </div>
        </TabsContent>

        <TabsContent value="integrity" className="mt-6">
          <IntegrityAnalysis integrity={analysis.integrity} />
        </TabsContent>

      </Tabs>
    </div>
  );
}
