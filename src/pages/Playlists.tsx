import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Eye, Loader2 } from "lucide-react";
import { PlaylistEmptyState } from "@/components/playlist/PlaylistEmptyState";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { PlaylistCardSkeleton } from "@/components/playlist/PlaylistCardSkeleton";
import { CreatePlaylistDialog } from "@/components/playlist/CreatePlaylistDialog";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import api from "@/lib/api";

const Playlists = () => {
  const { playlists, isLoadingPlaylists, refreshPlaylists, removePlaylist, addPlaylist } = useData();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmptyState, setShowEmptyState] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Refresh playlists on mount if needed (context handles caching)
    refreshPlaylists();
  }, [refreshPlaylists]);

  const handleDelete = async (id: string) => {
    try {
      await api.deletePlaylist(id);
      // Remove from context
      removePlaylist(id);
      toast({
        title: "Success",
        description: "Playlist deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete playlist",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const original = playlists.find(p => p.id === id);
      if (original) {
        const playlistData = await api.getPlaylist(id) as { ok: boolean; playlist: any };
        if (playlistData.ok && playlistData.playlist) {
          const duplicate = {
            name: `${original.name} (Copy)`,
            description: playlistData.playlist.description,
            tags: playlistData.playlist.tags,
            slots: playlistData.playlist.slots,
          };
          const response = await api.createPlaylist(duplicate) as { ok: boolean; playlist: any };
          if (response.ok && response.playlist) {
            // Add to context
            addPlaylist(response.playlist);
            toast({
              title: "Success",
              description: "Playlist duplicated successfully",
            });
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate playlist",
        variant: "destructive",
      });
    }
  };

  const handleCreateSuccess = async () => {
    // Refresh playlists to get the new one
    await refreshPlaylists();
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const hasPlaylists = !showEmptyState && !isLoadingPlaylists && playlists.length > 0;

  if (isLoadingPlaylists && playlists.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Controls Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="h-10 w-full sm:max-w-md bg-muted animate-pulse rounded" />
            <div className="h-10 w-full sm:w-auto bg-muted animate-pulse rounded" />
          </div>
          
          {/* Playlist Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PlaylistCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Empty State Toggle */}
      {/* <div className="flex items-center justify-end gap-2 mb-4 p-3 bg-muted/30 rounded-lg border border-border">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <Label htmlFor="playlist-empty-state" className="text-sm text-muted-foreground cursor-pointer">
          Show Empty State (Demo)
        </Label>
        <Switch
          id="playlist-empty-state"
          checked={showEmptyState}
          onCheckedChange={setShowEmptyState}
        />
      </div> */}

      {!hasPlaylists ? (
          <PlaylistEmptyState onCreate={() => setCreateDialogOpen(true)} />
        ) : (
          <div className="space-y-6">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search playlists by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add New Playlist
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Total Playlists: {playlists.length}</span>
              <span>Complete: {playlists.filter(p => p.slotCount === 8).length}</span>
              <span>In Progress: {playlists.filter(p => p.slotCount < 8).length}</span>
            </div>

            {/* Playlist Grid */}
            {filteredPlaylists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No playlists found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaylists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            )}
        </div>
      )}

      <CreatePlaylistDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Playlists;
