import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import api from "@/lib/api";

interface Playlist {
  id: string;
  name: string;
}

interface AssignPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screenId: string;
  onAssign?: () => void;
}

const AssignPlaylistModal = ({ open, onOpenChange, screenId, onAssign }: AssignPlaylistModalProps) => {
  const { toast } = useToast();
  const { playlists, refreshPlaylists, refreshScreens } = useData();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (open) {
        setLoading(true);
        try {
          // Refresh playlists if needed
          await refreshPlaylists();
          
          // Get current screen config to show current playlist
          const playerResponse = await api.getPlayer(screenId);
          if (playerResponse.ok && playerResponse.player) {
            const currentPlaylist = playerResponse.player.playlistId;
            setCurrentPlaylistId(currentPlaylist || null);
            setSelectedPlaylist(currentPlaylist || null);
          }
        } catch (error) {
          console.error("Error loading data:", error);
          toast({
            title: "Error",
            description: "Failed to load playlists.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Reset when modal closes
        setSelectedPlaylist(null);
        setCurrentPlaylistId(null);
      }
    };

    loadData();
  }, [open, screenId, toast, refreshPlaylists]);

  const handleAssign = async () => {
    // Allow clearing playlist by selecting "None"
    if (selectedPlaylist === currentPlaylistId) {
      toast({
        title: "No Change",
        description: "This playlist is already assigned to this screen.",
      });
      return;
    }

    setSaving(true);
    try {
      // Use updateScreenConfig API (same as EditScreenModal)
      const playlistIdToSend = selectedPlaylist && selectedPlaylist !== "none" ? selectedPlaylist : null;
      
      await api.updateScreenConfig(screenId, {
        playlistId: playlistIdToSend,
      });

      toast({
        title: "Success",
        description: playlistIdToSend 
          ? "Playlist assigned successfully." 
          : "Playlist removed successfully.",
      });
      
      // Refresh screens to update the UI
      await refreshScreens();
      
      onAssign?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error assigning playlist:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to assign playlist.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Playlist</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <div className="grid gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {currentPlaylistId 
                ? "Select a playlist to assign to this screen. Current assignment is highlighted."
                : "Select a playlist to assign to this screen."}
            </p>
            <div className="grid gap-2 max-h-[400px] overflow-y-auto">
              <Button
                variant={selectedPlaylist === "none" || selectedPlaylist === null ? "secondary" : "outline"}
                onClick={() => setSelectedPlaylist("none")}
                className="justify-start"
              >
                {currentPlaylistId ? "Remove Playlist (None)" : "None (No Playlist)"}
              </Button>
              {playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant={selectedPlaylist === playlist.id ? "secondary" : "outline"}
                  onClick={() => setSelectedPlaylist(playlist.id)}
                  className="justify-start"
                >
                  {playlist.name}
                  {currentPlaylistId === playlist.id && (
                    <span className="ml-2 text-xs text-muted-foreground">(Current)</span>
                  )}
                </Button>
              ))}
              {playlists.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No playlists available. Create a playlist first.
                </p>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={saving || loading}>
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              selectedPlaylist === "none" || selectedPlaylist === null ? "Remove" : "Assign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignPlaylistModal;
