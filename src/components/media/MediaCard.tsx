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
}

interface MediaCardProps {
  media: MediaItem;
  onDelete: (id: string) => void;
}

export const MediaCard = ({ media, onDelete }: MediaCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{media.name}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="my-4">
            {media.type === "image" ? (
              <img
                src={media.url}
                alt={media.name}
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
                <FileVideo className="w-24 h-24 text-muted-foreground" />
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
