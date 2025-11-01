'use server';

import { analyzeResumeFlow } from '@/ai/flows/resume-analysis-flow';
import type { ResumeAnalysisOutput } from '@/ai/flows/resume-analysis-flow';

export async function analyzeResumeAction(formData: FormData): Promise<{
  success: boolean;
  data?: ResumeAnalysisOutput;
  error?: string;
}> {
  try {
    const file = formData.get('resume') as File;
    
    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      };
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      return {
        success: false,
        error: 'Please upload a PDF file',
      };
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'File size must be less than 5MB',
      };
    }

    // Convert PDF to text using Gemini's multimodal capabilities
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    // Use Gemini to extract text from PDF
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64,
        },
      },
      'Extract all text content from this resume PDF. Provide the complete text in a structured format.',
    ]);

    const resumeText = result.response.text();

    if (!resumeText || resumeText.trim().length === 0) {
      return {
        success: false,
        error: 'Could not extract text from PDF. Please ensure the PDF contains readable text.',
      };
    }

    // Analyze the resume using our AI flow
    const analysis = await analyzeResumeFlow({ resumeText });

    return {
      success: true,
      data: analysis,
    };
  } catch (error: any) {
    console.error('Resume analysis error:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze resume. Please try again.',
    };
  }
}
