'use server';

/**
 * @fileOverview Optimizes production line schedules using AI.
 *
 * - optimizeProductionSchedule - A function that optimizes the production schedule.
 * - OptimizeProductionScheduleInput - The input type for the optimizeProductionSchedule function.
 * - OptimizeProductionScheduleOutput - The return type for the optimizeProductionSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeProductionScheduleInputSchema = z.object({
  productionData: z
    .string()
    .describe(
      'Real-time production data, including machine status, employee performance, and material availability.'
    ),
  constraints: z
    .string()
    .describe(
      'Constraints such as deadlines, priority orders, and machine maintenance schedules.'
    ),
  optimizationGoals: z
    .string()
    .describe(
      'Optimization goals such as minimizing bottlenecks, maximizing efficiency, and reducing costs.'
    ),
});
export type OptimizeProductionScheduleInput = z.infer<
  typeof OptimizeProductionScheduleInputSchema
>;

const OptimizeProductionScheduleOutputSchema = z.object({
  optimizedSchedule: z
    .string()
    .describe(
      'An optimized production schedule that minimizes bottlenecks and maximizes efficiency.'
    ),
  predictedBottlenecks: z
    .string()
    .describe('Potential bottlenecks in the production process.'),
});
export type OptimizeProductionScheduleOutput = z.infer<
  typeof OptimizeProductionScheduleOutputSchema
>;

export async function optimizeProductionSchedule(
  input: OptimizeProductionScheduleInput
): Promise<OptimizeProductionScheduleOutput> {
  return optimizeProductionScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeProductionSchedulePrompt',
  input: {schema: OptimizeProductionScheduleInputSchema},
  output: {schema: OptimizeProductionScheduleOutputSchema},
  prompt: `You are an AI assistant that helps production managers optimize production line schedules based on real-time data.

You will analyze the production data, constraints, and optimization goals to generate an optimized production schedule that minimizes bottlenecks and maximizes efficiency.

Production Data: {{{productionData}}}
Constraints: {{{constraints}}}
Optimization Goals: {{{optimizationGoals}}}

Based on the information provided, generate an optimized production schedule and predict any potential bottlenecks in the production process.

Return the optimized schedule and predicted bottlenecks in JSON format.`,
});

const optimizeProductionScheduleFlow = ai.defineFlow(
  {
    name: 'optimizeProductionScheduleFlow',
    inputSchema: OptimizeProductionScheduleInputSchema,
    outputSchema: OptimizeProductionScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
