import {genkit} from 'genkit';
import {googleAI} from '@gen-kit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-pro',
});
