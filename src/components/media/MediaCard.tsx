import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, FileVideo, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  duration?: string;
  tags: string[];
  uploadDate: string;
  size: string;
  publicId?: string;
}

interface MediaCardProps {
  media: MediaItem;
  onDelete: (id: string) => void;
}

export const MediaCard = ({ media, onDelete }: MediaCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Self-hosted assets: no thumbnails (files served as-is). Videos show placeholder + duration.

  const handleDelete = () => {
    onDelete(media.id);
    setShowDeleteDialog(false);
    toast({
      title: "Media deleted",
      description: "The media asset has been removed from your library.",
    });
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden group">
            {media.type === "image" ? (
              <img
                src={media.url}
                alt={media.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full bg-black">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none group-hover:opacity-0 transition-opacity bg-black/20">
                  <FileVideo className="w-12 h-12 text-white/70" />
                  {media.duration && (
                    <div className="flex items-center gap-1 text-sm text-white/80 font-medium">
                      <Clock className="w-4 h-4" />
                      <span>{media.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile preview-only trigger area */}
            <div
              className="absolute inset-0 md:hidden z-10"
              onClick={() => setShowPreview(true)}
              aria-label="Preview"
            />

            {/* Hover overlay (Desktop only) */}
            <div className="absolute inset-0 bg-black/60 opacity-0 md:group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-3 p-4">
          <div className="w-full space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm line-clamp-1">{media.name}</h3>
              <Badge variant="outline" className="shrink-0">
                {media.type}
              </Badge>
            </div>

            {media.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {media.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{media.uploadDate}</span>
              <span>{media.size}</span>
            </div>
          </div>

          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 md:hidden"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this asset? It will also be removed from any playlists using it.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl w-full max-h-[95vh] flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle className="truncate">{media.name}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="my-4 flex-1 overflow-auto flex items-center justify-center">
            {media.type === "image" ? (
              <img
                src={media.url}
                alt={media.name}
                className="max-w-full max-h-[70vh] w-auto h-auto rounded-lg object-contain"
              />
            ) : (
              <div className="w-full max-w-full bg-black rounded-lg overflow-hidden">
                <video
                  src={media.url}
                  controls
                  className="w-full h-auto max-h-[70vh]"
                  preload="metadata"
                  crossOrigin="anonymous"
                  style={{ maxWidth: '100%' }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
