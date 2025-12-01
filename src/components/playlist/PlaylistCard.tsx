import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Copy, Trash2, Clock } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

interface Playlist {
  id: string;
  name: string;
  description: string;
  tags: string[];
  totalDuration: string;
  lastUpdated: string;
  slotCount: number;
}

interface PlaylistCardProps {
  playlist: Playlist;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const PlaylistCard = ({ playlist, onDelete, onDuplicate }: PlaylistCardProps) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete(playlist.id);
    setShowDeleteDialog(false);
    toast({
      title: "Playlist deleted",
      description: "The playlist has been removed successfully.",
    });
  };

  const handleDuplicate = () => {
    onDuplicate(playlist.id);
    toast({
      title: "Playlist duplicated",
      description: "A copy of the playlist has been created.",
    });
  };

  const formatDuration = (duration: string) => {
  // duration comes like: "1:44.73913800000001"
  const [min, sec] = duration.split(":");
  const wholeSec = Math.floor(Number(sec));
  return `${min} min ${wholeSec} sec`;
};


  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground mb-1">
                  {playlist.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {playlist.description}
                </p>
              </div>
              <Badge variant="outline" className="ml-2">
                {playlist.slotCount}/8 slots
              </Badge>
            </div>

            {playlist.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {playlist.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(playlist.totalDuration)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Updated {playlist.lastUpdated}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/50 p-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/playlists/${playlist.id}/preview`)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/playlists/${playlist.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
