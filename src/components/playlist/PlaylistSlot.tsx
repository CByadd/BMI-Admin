import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileVideo, FileImage, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SlotMedia {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  duration: number; // in seconds
  thumbnail?: string;
}

const DEFAULT_IMAGE_DURATION = 10;

const normalizeVideoDuration = (value: unknown): number | null => {
  const numeric = typeof value === "string" ? parseFloat(value) : Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.max(1, Math.round(numeric));
};

interface PlaylistSlotProps {
  slotNumber: number;
  media: SlotMedia | null;
  onMediaAdd: (slotNumber: number, media: SlotMedia) => void;
  onMediaRemove: (slotNumber: number) => void;
  onDurationChange: (slotNumber: number, duration: number) => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB for images
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10 MB for videos

export const PlaylistSlot = ({
  slotNumber,
  media,
  onMediaAdd,
  onMediaRemove,
  onDurationChange,
}: PlaylistSlotProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const checkAssetSize = (file: File): boolean => {
    const isVideo = file.type.startsWith("video/");
    const limit = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    const limitMb = isVideo ? 10 : 5;

    if (file.size > limit) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      toast({
        title: "Asset too large",
        description: `${file.name} is too large (${mb} MB). ${isVideo ? 'Videos' : 'Images'} must be less than ${limitMb} MB.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    try {
      // Try to get media data from drag event
      const mediaDataString = e.dataTransfer.getData('application/json');
      if (mediaDataString) {
        const mediaData: SlotMedia = JSON.parse(mediaDataString);
        onMediaAdd(slotNumber, mediaData);
        return;
      }

      // Fallback: if no JSON data, try to get file
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (!checkAssetSize(file)) return;
        const mockMedia: SlotMedia = {
          id: `media-${Date.now()}`,
          name: file.name,
          type: file.type.startsWith("video") ? "video" : "image",
          url: URL.createObjectURL(file),
          duration: file.type.startsWith("video") ? (normalizeVideoDuration((file as File & { duration?: number }).duration) || DEFAULT_IMAGE_DURATION) : DEFAULT_IMAGE_DURATION,
        };
        onMediaAdd(slotNumber, mockMedia);
        return;
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!checkAssetSize(file)) return;
      const mockMedia: SlotMedia = {
        id: `media-${Date.now()}`,
        name: file.name,
        type: file.type.startsWith("video") ? "video" : "image",
        url: URL.createObjectURL(file),
        duration: file.type.startsWith("video") ? (normalizeVideoDuration((file as File & { duration?: number }).duration) || DEFAULT_IMAGE_DURATION) : DEFAULT_IMAGE_DURATION,
      };
      onMediaAdd(slotNumber, mockMedia);
    }
  };

  return (
    <Card
      className={`relative p-4 transition-all ${isDragging ? "border-primary bg-primary/5 border-2" : "border-border"
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="absolute top-2 left-2 z-10">
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
          {slotNumber}
        </div>
      </div>

      {!media ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag asset here or upload
          </p>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            id={`upload-slot-${slotNumber}`}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(`upload-slot-${slotNumber}`)?.click()}
          >
            Upload Media
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {media.type === "image" ? (
              <img
                src={media.url}
                alt={media.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden group">
                <video
                  src={`${media.url}#t=0.1`}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                  crossOrigin="anonymous"
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0.1;
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity bg-black/10">
                  <FileVideo className="w-10 h-10 text-white/50" />
                </div>
              </div>
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => onMediaRemove(slotNumber)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground truncate mb-2">
              {media.name}
            </p>

            <div className="space-y-2">
              <Label className="text-xs">
                {media.type === "video" ? "Video Duration" : "Display Duration"}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={media.duration}
                  onChange={(e) => onDurationChange(slotNumber, parseInt(e.target.value) || 10)}
                  disabled={media.type === "video"}
                  className="h-8"
                />
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">seconds</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
