
import type { PlainLanguageAnalysisOutput } from '@/ai/flows/plain-language-analysis';
import CategoryScoreCard from './category-score-card';
import OverallScoreChart from './overall-score-chart';
import { ClipboardCheck, Combine, Image as ImageIcon, CheckCircle, BarChartHorizontal, AlertCircle, List } from 'lucide-react';
import ReportSummary from './report-summary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ReportDisplayProps = {
  analysis: PlainLanguageAnalysisOutput;
};

export default function ReportDisplay({ analysis }: ReportDisplayProps) {
  return (
    <div className="space-y-8">
      <OverallScoreChart score={analysis.overallScore} />
      
      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="summary">
            <BarChartHorizontal className="mr-2 h-4 w-4" />
            Résumé
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <List className="mr-2 h-4 w-4" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            <CheckCircle className="mr-2 h-4 w-4" />
            Détails
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {analysis.mainIssues && analysis.mainIssues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Problèmes principaux
                  </CardTitle>
                  <CardDescription>
                    Les problèmes détectés dans votre contenu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.mainIssues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Badge variant="destructive" className="mt-0.5">
                          {idx + 1}
                        </Badge>
                        <span className="text-sm">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Recommandations
                  </CardTitle>
                  <CardDescription>
                    Comment améliorer votre contenu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-0.5">
                          {idx + 1}
                        </Badge>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="mt-6 space-y-6">
          <ReportSummary analysis={analysis} />
        </TabsContent>

        <TabsContent value="breakdown" className="mt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CategoryScoreCard
              icon={<ClipboardCheck className="h-6 w-6" />}
              title="Clarté du texte"
              score={analysis.textClarityScore}
              feedback={analysis.textClarityFeedback}
            />
            <CategoryScoreCard
              icon={<Combine className="h-6 w-6" />}
              title="Clarté structurelle"
              score={analysis.structureClarityScore}
              feedback={analysis.structureClarityFeedback}
            />
            <CategoryScoreCard
              icon={<ImageIcon className="h-6 w-6" />}
              title="Clarté visuelle"
              score={analysis.visualClarityScore}
              feedback={analysis.visualClarityFeedback}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
