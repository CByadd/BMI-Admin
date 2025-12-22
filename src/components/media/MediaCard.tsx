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
  const [thumbnailError, setThumbnailError] = useState(false);

  // Generate Cloudinary thumbnail URL for videos
  const getVideoThumbnail = (url: string, publicId?: string): string => {
    if (!url) return '';
    
    // Cloudinary video thumbnail transformation
    // so_1 = start offset at 1 second (get frame at 1 second)
    // w_400,h_300 = width and height
    // c_fill = crop fill
    // f_jpg = format as jpg (for thumbnail)
    // q_auto = quality auto
    
    if (url.includes('cloudinary.com')) {
      try {
        // Extract the base URL and path
        // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{version}/{public_id}.{format}
        // For videos: https://res.cloudinary.com/{cloud_name}/video/upload/{version}/{public_id}.mp4
        // Thumbnail: https://res.cloudinary.com/{cloud_name}/video/upload/so_1,w_400,h_300,c_fill,f_jpg,q_auto/{version}/{public_id}.jpg
        
        // Replace video format with jpg and add transformations
        if (url.includes('/video/upload/')) {
          // Check if transformations already exist
          const hasTransformations = url.match(/\/video\/upload\/([^/]+\/){2,}/);
          
          if (!hasTransformations) {
            // No transformations, add them
            // Pattern: /video/upload/{version}/{public_id}.mp4
            // Result: /video/upload/so_1,w_400,h_300,c_fill,f_jpg,q_auto/{version}/{public_id}.jpg
            return url
              .replace(/\/video\/upload\//, '/video/upload/so_1,w_400,h_300,c_fill,f_jpg,q_auto/')
              .replace(/\.(mp4|mov|avi|webm|mkv)$/i, '.jpg');
          } else {
            // Has transformations, insert before them or replace
            return url
              .replace(/\/video\/upload\/([^/]+\/)/, '/video/upload/so_1,w_400,h_300,c_fill,f_jpg,q_auto/$1')
              .replace(/\.(mp4|mov|avi|webm|mkv)$/i, '.jpg');
          }
        }
      } catch (error) {
        console.error('Error generating video thumbnail:', error);
      }
    }
    
    return url;
  };

  const videoThumbnail = media.type === "video" ? getVideoThumbnail(media.url, media.publicId) : null;

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
              <>
                {videoThumbnail && !thumbnailError ? (
                  <img
                    src={videoThumbnail}
                    alt={media.name}
                    className="w-full h-full object-cover"
                    onError={() => setThumbnailError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileVideo className="w-16 h-16 text-muted-foreground" />
                    {media.duration && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{media.duration}</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Video play indicator overlay */}
                {videoThumbnail && !thumbnailError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <FileVideo className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
          
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
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
