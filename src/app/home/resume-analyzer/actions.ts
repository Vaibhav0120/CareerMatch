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

    // Extract text from PDF using pdf-parse v2
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // @ts-ignore - pdf-parse is a CommonJS module
    const { PDFParse } = require('pdf-parse');
    
    // Parse PDF to extract text using pdf-parse v2 API
    const parser = new PDFParse({ data: uint8Array });
    const result = await parser.getText();
    const resumeText = result.text;

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
