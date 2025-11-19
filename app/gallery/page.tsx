'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SavedImage } from '@/lib/supabase';
import ImageGallery from '@/components/ImageGallery';

export default function GalleryPage() {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/images');
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

  const handleReorder = async (newImages: SavedImage[]) => {
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

  const handleDelete = async (id: string) => {
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Gallery</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Drag and drop to reorder your images
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Generate New Image
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading gallery...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No images in your gallery yet.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Generate Your First Image
          </Link>
        </div>
      ) : (
        <ImageGallery
          images={images}
          onReorder={handleReorder}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
