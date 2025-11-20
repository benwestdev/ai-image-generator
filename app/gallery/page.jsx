'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import ImageGallery from '@/components/ImageGallery';

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('gallery');

  useEffect(() => {
    fetchImages();
  }, [view]);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/images${view === 'gallery' ? '?gallery=true' : ''}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch images');
      }

      setImages(data.images || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (newImages) => {
    setImages(newImages);

    try {
      const response = await fetch('/api/images', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: newImages }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      // Revert on error
      fetchImages();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`/api/images?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setImages(images.filter((img) => img.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleAddToGallery = async (id) => {
    try {
      const response = await fetch('/api/images', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, is_gallery: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to gallery');
      }

      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, is_gallery: true } : img))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleToggleGallery = async (id, isGallery) => {
    try {
      const response = await fetch('/api/images', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, is_gallery: isGallery }),
      });

      if (!response.ok) {
        throw new Error('Failed to update gallery status');
      }

      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, is_gallery: isGallery } : img
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Your Gallery
        </h2>
        <p className="text-muted-foreground mb-4">
          Drag and drop to reorder your images
        </p>
        <Button asChild variant="outline">
          <Link href="/">Generate New Image</Link>
        </Button>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        <Button
          variant={view === 'gallery' ? 'default' : 'outline'}
          onClick={() => setView('gallery')}
        >
          Gallery only
        </Button>
        <Button
          variant={view === 'all' ? 'default' : 'outline'}
          onClick={() => setView('all')}
        >
          All images
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading gallery...</p>
          </CardContent>
        </Card>
      ) : images.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {view === 'gallery'
                ? 'No images in your gallery yet.'
                : 'No images saved yet.'}
            </p>
            <Button asChild>
              <Link href="/">Generate Your First Image</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ImageGallery
          images={images}
          onReorder={view === 'gallery' ? handleReorder : undefined}
          onDelete={handleDelete}
          onToggleGallery={handleToggleGallery}
        />
      )}
    </div>
  );
}
