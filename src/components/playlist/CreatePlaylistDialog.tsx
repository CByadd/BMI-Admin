import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Music2, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface CreatePlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreatePlaylistDialog = ({ open, onOpenChange, onSuccess }: CreatePlaylistDialogProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a playlist name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      
      // Actually create the playlist via API
      const response = await api.createPlaylist({
        name: name.trim(),
        description: description.trim() || undefined,
        tags: tags.trim() || undefined,
      }) as { ok: boolean; playlist: { id: string } };

      if (response.ok && response.playlist) {
        toast({
          title: "Playlist created",
          description: "Now add media to your 8 slots.",
        });
        
        // Reset form
        setName("");
        setDescription("");
        setTags("");
        onOpenChange(false);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Navigate to editor with the actual playlist ID
        navigate(`/playlists/${response.playlist.id}/edit`);
      } else {
        throw new Error("Failed to create playlist");
      }
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create playlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setName("");
      setDescription("");
      setTags("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        {/* Modern Header with Gradient */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8 border-b border-border/50">
          <div className="absolute top-4 right-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-foreground">
              Create New Playlist
            </DialogTitle>
            <p className="text-sm sm:text-base text-muted-foreground pr-16">
              Start building your content sequence. You can add up to 8 media slots.
            </p>
          </DialogHeader>
        </div>

        {/* Form Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Playlist Name */}
          <div className="space-y-3">
            <Label htmlFor="playlist-name" className="text-base font-semibold flex items-center gap-2">
              <Music2 className="w-4 h-4 text-primary" />
              Playlist Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="playlist-name"
              placeholder="e.g., Morning Routine Ads, Health Campaign, Product Showcase"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim() && !creating) {
                  handleCreate();
                }
              }}
              className="h-12 text-base"
              disabled={creating}
            />
            <p className="text-xs text-muted-foreground">
              Choose a descriptive name that helps you identify this playlist later.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-semibold">
              Description <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose, theme, or target audience for this playlist..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none text-base"
              disabled={creating}
            />
            <p className="text-xs text-muted-foreground">
              Add context about when and where this playlist will be used.
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label htmlFor="tags" className="text-base font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Tags <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="tags"
              placeholder="e.g., Health, Campaign, Morning, Promotional (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="h-12 text-base"
              disabled={creating}
            />
            <p className="text-xs text-muted-foreground">
              Add tags to organize and filter your playlists easily.
            </p>
          </div>
        </div>

        {/* Footer with Actions */}
        <DialogFooter className="p-6 sm:p-8 border-t border-border/50 bg-muted/30">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:ml-auto">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={creating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create & Continue
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
