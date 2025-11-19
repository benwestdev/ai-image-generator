'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleSave = async () => {
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save image');
      }

      setSuccessMessage('Image saved successfully!');
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Generate Your Image</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Describe what you want to see and let AI create it
        </p>
        <Link
          href="/gallery"
          className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          View Gallery
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A serene landscape with mountains and a lake at sunset"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            rows={4}
            disabled={isGenerating}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
          {successMessage}
        </div>
      )}

      {isGenerating && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Creating your image... This may take a minute.
          </p>
        </div>
      )}

      {generatedImage && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
            <Image
              src={generatedImage}
              alt="Generated image"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSaving ? 'Saving...' : 'Keep Image'}
            </button>
            <button
              onClick={handleDiscard}
              disabled={isSaving}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
