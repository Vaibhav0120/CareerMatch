import { ai } from '../genkit';
import { z } from 'zod';

// Define the output schema for resume analysis
const ResumeAnalysisSchema = z.object({
  strengths: z.array(z.string()).describe('List of key strengths identified in the resume (3-5 items)'),
  weaknesses: z.array(z.string()).describe('List of areas for improvement (3-5 items)'),
  courseSuggestions: z.array(z.object({
    title: z.string(),
    reason: z.string(),
    platform: z.string().optional(),
  })).describe('Recommended courses to enhance skills (3-5 courses)'),
  internshipSuggestions: z.array(z.object({
    role: z.string(),
    industry: z.string(),
    reason: z.string(),
    requiredSkills: z.array(z.string()),
  })).describe('Best fit internship opportunities (3-5 suggestions)'),
  overallSummary: z.string().describe('A brief overall summary of the candidate profile'),
});

export type ResumeAnalysisOutput = z.infer<typeof ResumeAnalysisSchema>;

export const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResume',
    inputSchema: z.object({
      resumeText: z.string().describe('The extracted text content from the resume PDF'),
    }),
    outputSchema: ResumeAnalysisSchema,
  },
  async (input) => {
    const result = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are an expert career advisor and resume analyzer. Analyze the following resume and provide detailed insights.

Resume Content:
${input.resumeText}

Provide a comprehensive analysis including:
1. Key strengths and positive aspects of the candidate's profile
2. Areas for improvement or weaknesses that could be addressed
3. Specific course recommendations that would enhance their skills (include course titles, reasons, and suggested platforms like Coursera, Udemy, etc.)
4. Best fit internship opportunities based on their background (include role titles, industries, reasons for fit, and required skills)
5. An overall summary of the candidate's profile

Be specific, constructive, and actionable in your feedback.`,
      output: {
        schema: ResumeAnalysisSchema,
      },
    });

    return result.output!;
  }
);
