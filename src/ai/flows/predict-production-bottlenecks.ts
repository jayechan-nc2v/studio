'use server';
/**
 * @fileOverview An AI agent for predicting production bottlenecks.
 *
 * - predictProductionBottlenecks - A function that predicts bottlenecks in the production line.
 * - PredictProductionBottlenecksInput - The input type for the predictProductionBottlenecks function.
 * - PredictProductionBottlenecksOutput - The return type for the predictProductionBottlenecks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictProductionBottlenecksInputSchema = z.object({
  currentPerformanceData: z
    .string()
    .describe(
      'Current performance data of the production line, including throughput, defect rates, and machine downtime.  Include units.  For example: Sewing: 100 units/hour, QC: 95 units/hour, Cutting: 110 units/hour.'
    ),
  historicalData: z
    .string()
    .describe(
      'Historical data of the production line, including past performance, seasonal trends, and previous bottleneck events.'
    ),
  productionSchedule: z
    .string()
    .describe(
      'The current production schedule, including style information, quantities, and deadlines.'
    ),
});
export type PredictProductionBottlenecksInput = z.infer<
  typeof PredictProductionBottlenecksInputSchema
>;

const PredictProductionBottlenecksOutputSchema = z.object({
  predictedBottlenecks: z
    .string()
    .describe(
      'A detailed prediction of potential bottlenecks in the production line, including the specific stage, the expected impact, and the confidence level.'
    ),
  recommendations: z
    .string()
    .describe(
      'Specific recommendations to address the predicted bottlenecks, including adjustments to the production schedule, resource allocation, or process improvements.'
    ),
});
export type PredictProductionBottlenecksOutput = z.infer<
  typeof PredictProductionBottlenecksOutputSchema
>;

export async function predictProductionBottlenecks(
  input: PredictProductionBottlenecksInput
): Promise<PredictProductionBottlenecksOutput> {
  return predictProductionBottlenecksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictProductionBottlenecksPrompt',
  input: {schema: PredictProductionBottlenecksInputSchema},
  output: {schema: PredictProductionBottlenecksOutputSchema},
  prompt: `You are an expert production supervisor with years of experience in garment manufacturing. Your goal is to analyze production data and predict potential bottlenecks in the production line.

  Based on the current performance data, historical data, and production schedule, identify potential bottlenecks, their expected impact, and recommend solutions.

Current Performance Data: {{{currentPerformanceData}}}
Historical Data: {{{historicalData}}}
Production Schedule: {{{productionSchedule}}}

Respond with the predicted bottlenecks and recommendations in a detailed report.

{{output}}
`,
});

const predictProductionBottlenecksFlow = ai.defineFlow(
  {
    name: 'predictProductionBottlenecksFlow',
    inputSchema: PredictProductionBottlenecksInputSchema,
    outputSchema: PredictProductionBottlenecksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

