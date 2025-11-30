import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface CreatePlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePlaylistDialog = ({ open, onOpenChange }: CreatePlaylistDialogProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const handleCreate = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a playlist name.",
        variant: "destructive",
      });
      return;
    }

    // Create playlist and redirect to editor
    const playlistId = `playlist-${Date.now()}`;
    toast({
      title: "Playlist created",
      description: "Now add media to your 8 slots.",
    });
    
    // Reset form
    setName("");
    setDescription("");
    setTags("");
    onOpenChange(false);
    
    // Navigate to editor
    navigate(`/playlists/${playlistId}/edit`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="playlist-name">Playlist Name *</Label>
            <Input
              id="playlist-name"
              placeholder="e.g., Morning Routine Ads"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Short text about content purpose or theme"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              placeholder="e.g., Health, Campaign (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>
            Continue to Editor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
