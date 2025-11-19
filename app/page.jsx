'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, Trash } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const isActionDisabled = isGenerating || !prompt.trim();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveImage = async (toGallery = false) => {
    if (!generatedImage) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: generatedImage,
          prompt: prompt,
          is_gallery: toGallery,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save image');
      }

      setSuccessMessage(toGallery ? 'Saved to gallery!' : 'Image saved.');
      setGeneratedImage(null);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };


  const handleDiscard = () => {
    setGeneratedImage(null);
    setSuccessMessage(null);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 md:space-y-10">
      <h2 className="text-2xl font-semibold text-center">Generate</h2>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-lg">Prompt</CardTitle>
          <CardDescription>Describe what you want.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type a prompt"
            rows={4}
            disabled={isGenerating}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              onClick={() => setPrompt('')}
              variant="ghost"
              className="w-full sm:w-auto"
              disabled={isGenerating && !prompt}
            >
              Clear
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isActionDisabled}
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Preview</CardTitle>
              <CardDescription>Result comes here. Save it or discard.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/gallery">Gallery</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-green-500 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="relative overflow-hidden rounded-lg border bg-muted/60 aspect-square flex items-center justify-center max-w-[320px] sm:max-w-[360px] mx-auto">
            {isGenerating && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Working...</p>
                </div>
              </div>
            )}

            {generatedImage ? (
              <Image
                src={generatedImage}
                alt="Generated image"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 420px"
              />
            ) : (
              <div className="text-center space-y-1 px-6">
                <p className="text-sm text-muted-foreground">
                  Nothing yet. Generate an image to see it here.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => saveImage(false)}
              disabled={isSaving || !generatedImage}
              className="w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
            <Button
              onClick={() => saveImage(true)}
              disabled={isSaving || !generatedImage}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Save to gallery
            </Button>
            <Button
              onClick={handleDiscard}
              disabled={isSaving || !generatedImage}
              variant="ghost"
              className="w-full sm:w-auto"
            >
              Discard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
