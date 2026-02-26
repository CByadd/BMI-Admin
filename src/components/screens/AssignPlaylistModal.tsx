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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Music } from "lucide-react";
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
          const playerResponse = await api.getPlayer(screenId) as any;
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
          <div className="space-y-6">
            {/* Current Assignment Display */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Playlist</p>
                  <p className="font-semibold text-foreground">
                    {currentPlaylistId
                      ? playlists.find(p => p.id === currentPlaylistId)?.name || "Unknown Playlist"
                      : "No Playlist Assigned"}
                  </p>
                </div>
              </div>
              {currentPlaylistId && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Active
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Assign New Playlist</label>
                <Select
                  value={selectedPlaylist || "none"}
                  onValueChange={(value) => setSelectedPlaylist(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a playlist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {currentPlaylistId ? "Remove Playlist (None)" : "None (No Playlist)"}
                    </SelectItem>
                    {playlists.map((playlist) => (
                      <SelectItem key={playlist.id} value={playlist.id}>
                        {playlist.name}
                        {currentPlaylistId === playlist.id && " (Current)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {playlists.length === 0 && (
                  <p className="text-xs text-danger mt-1">
                    No playlists available. Please create one in the Playlists section.
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Select a playlist from the dropdown above to assign it to this screen.
                You can also choose "Remove" to clear the current assignment.
              </p>
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
