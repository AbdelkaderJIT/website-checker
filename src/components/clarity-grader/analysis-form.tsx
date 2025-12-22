'use client';

import { getClarityAnalysis } from '@/app/clarity-grader/actions';
import type { PlainLanguageAnalysisOutput } from '@/ai/flows/plain-language-analysis';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const FormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL (e.g., https://example.com).' }),
});

type AnalysisFormProps = {
  onAnalysisStart: () => void;
  onAnalysisComplete: (result: PlainLanguageAnalysisOutput | null) => void;
};

export default function AnalysisForm({ onAnalysisStart, onAnalysisComplete }: AnalysisFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    onAnalysisStart();
    try {
      const result = await getClarityAnalysis(data);
      if (result.analysis) {
        onAnalysisComplete(result.analysis);
      } else {
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: result.message,
        });
        onAnalysisComplete(null);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `An unexpected error occurred: ${errorMessage}`,
      });
      onAnalysisComplete(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Website URL</FormLabel>
              <FormControl>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter a website URL to analyze..."
                    className="h-14 rounded-lg pl-10 text-base shadow-lg"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-lg text-base font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            'Check My Site'
          )}
        </Button>
      </form>
    </Form>
  );
}
