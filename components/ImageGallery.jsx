'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Trash2, GripVertical, Eye, EyeOff, Download } from 'lucide-react';

function SortableImage({ image, onDelete, onToggleGallery, enableDrag }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: enableDrag ? CSS.Transform.toString(transform) : undefined,
    transition: enableDrag ? transition : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="overflow-hidden group cursor-move hover:shadow-lg transition-shadow"
    >
      <div
        className="relative aspect-square bg-muted"
        {...(enableDrag ? { ...attributes, ...listeners } : {})}
      >
        <Image
          src={image.image_url}
          alt={image.prompt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {enableDrag && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-6 w-6 text-white drop-shadow-lg" />
          </div>
        )}
      </div>
      <CardFooter className="p-4">
        <div className="w-full space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                const link = document.createElement('a');
                const isWebp = image.image_url?.startsWith('data:image/webp');
                link.href = image.image_url;
                link.download = isWebp ? 'image.webp' : 'image.png';
                link.click();
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {onToggleGallery && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleGallery(image.id, !image.is_gallery);
                }}
              >
                {image.is_gallery ? 'Remove from gallery' : 'Add to gallery'}
              </Button>
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(image.id);
              }}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowPrompt(!showPrompt);
            }}
            variant="ghost"
            size="sm"
            className="w-full justify-start px-0"
          >
            {showPrompt ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Prompt
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Prompt
              </>
            )}
          </Button>
          {showPrompt && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {image.prompt}
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ImageGallery({ images, onReorder, onDelete, onToggleGallery }) {
  const enableDrag = Boolean(onReorder);

  const sensors = enableDrag
    ? useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 8,
          },
        }),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
      )
    : null;

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!enableDrag) return;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const newImages = arrayMove(images, oldIndex, newIndex);
      onReorder?.(newImages);
    }
  };

  if (!enableDrag) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <SortableImage
            key={image.id}
            image={image}
            onDelete={onDelete}
            onToggleGallery={onToggleGallery}
            enableDrag={false}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <SortableImage
              key={image.id}
              image={image}
              onDelete={onDelete}
              onToggleGallery={onToggleGallery}
              enableDrag
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
