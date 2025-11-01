'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  BookOpen,
  Briefcase,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
  FileText,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ResumeAnalysisOutput } from '@/ai/flows/resume-analysis-flow';
import { analyzeResumeAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export default function ResumeAnalyzerPage() {
  const [analysis, setAnalysis] = useState<ResumeAnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if we came from dashboard with a file
  useState(() => {
    if (typeof window !== 'undefined') {
      const storedFile = sessionStorage.getItem('pendingResumeFile');
      const storedFileName = sessionStorage.getItem('pendingResumeFileName');
      
      if (storedFile && storedFileName) {
        // Convert base64 back to File
        fetch(storedFile)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], storedFileName, { type: 'application/pdf' });
            setSelectedFile(file);
            // Clear from storage
            sessionStorage.removeItem('pendingResumeFile');
            sessionStorage.removeItem('pendingResumeFileName');
          });
      }
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a resume file');
      return;
    }

    setError(null);
    setAnalysis(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const result = await analyzeResumeAction(formData);

      if (result.success && result.data) {
        setAnalysis(result.data);
        toast({
          title: '✅ Analysis Complete',
          description: 'Your resume has been successfully analyzed.',
        });
      } else {
        setError(result.error || 'Failed to analyze resume');
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">AI Resume Analyzer</h1>
        <p className="text-muted-foreground">
          Upload your resume and get AI-powered insights on your strengths,
          weaknesses, and personalized recommendations.
        </p>
      </div>

      {/* Upload Section */}
      {!analysis && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Resume
            </CardTitle>
            <CardDescription>
              Upload your resume in PDF format (max 5MB) to receive detailed
              analysis and recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                id="resume-file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isPending}
                data-testid="resume-upload-input"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {selectedFile.name} ({
                    (selectedFile.size / 1024 / 1024).toFixed(2)
                  }{' '}
                  MB)
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={!selectedFile || isPending}
              className="w-full"
              size="lg"
              data-testid="analyze-resume-button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Summary */}
          <Card data-testid="analysis-summary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Overall Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {analysis.overallSummary}
              </p>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card data-testid="strengths-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Your Strengths
              </CardTitle>
              <CardDescription>
                Key areas where you excel and stand out
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card data-testid="weaknesses-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Areas for Improvement
              </CardTitle>
              <CardDescription>
                Opportunities to enhance your profile and skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Course Suggestions */}
          <Card data-testid="courses-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Recommended Courses
              </CardTitle>
              <CardDescription>
                Courses to help you bridge skill gaps and advance your career
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.courseSuggestions.map((course, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{course.title}</h4>
                      {course.platform && (
                        <Badge variant="outline">{course.platform}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {course.reason}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Internship Suggestions */}
          <Card data-testid="internships-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-500" />
                Best Fit Internship Opportunities
              </CardTitle>
              <CardDescription>
                Internship roles that align with your skills and experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.internshipSuggestions.map((internship, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{internship.role}</h4>
                        <p className="text-sm text-muted-foreground">
                          {internship.industry}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{internship.reason}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {internship.requiredSkills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setAnalysis(null);
                setSelectedFile(null);
              }}
              className="flex-1"
            >
              Analyze Another Resume
            </Button>
            <Button asChild className="flex-1">
              <Link href="/home/courses">
                <BookOpen className="mr-2 h-4 w-4" />
                Explore Courses
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
