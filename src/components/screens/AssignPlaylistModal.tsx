import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

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
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await api.get("/api/playlists");
        if (response.ok) {
          setPlaylists(response.data);
        }
      } catch (error) {
        console.error("Error fetching playlists:", error);
        toast({
          title: "Error",
          description: "Failed to load playlists.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPlaylists();
    }
  }, [open, toast]);

  const handleAssign = async () => {
    if (!selectedPlaylist) {
      toast({
        title: "No Playlist Selected",
        description: "Please select a playlist to assign.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await api.post(`/api/screens/${screenId}/assign-playlist`, { playlistId: selectedPlaylist });
      toast({
        title: "Success",
        description: "Playlist assigned successfully.",
      });
      onAssign?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning playlist:", error);
      toast({
        title: "Error",
        description: "Failed to assign playlist.",
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
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <p>Select a playlist to assign to this screen.</p>
            <div className="grid gap-2">
              {playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant={selectedPlaylist === playlist.id ? "secondary" : "outline"}
                  onClick={() => setSelectedPlaylist(playlist.id)}
                >
                  {playlist.name}
                </Button>
              ))}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={saving || loading}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignPlaylistModal;
