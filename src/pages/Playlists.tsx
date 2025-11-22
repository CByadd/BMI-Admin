import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Eye } from "lucide-react";
import { PlaylistEmptyState } from "@/components/playlist/PlaylistEmptyState";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { CreatePlaylistDialog } from "@/components/playlist/CreatePlaylistDialog";

// Mock data
const mockPlaylists = [
  {
    id: "1",
    name: "Morning Routine Ads",
    description: "Health awareness content for morning hours",
    tags: ["Health", "Morning"],
    totalDuration: "2:45",
    lastUpdated: "2 hours ago",
    slotCount: 8,
  },
  {
    id: "2",
    name: "Afternoon Campaign",
    description: "Promotional content for afternoon peak hours",
    tags: ["Campaign", "Promo"],
    totalDuration: "3:20",
    lastUpdated: "1 day ago",
    slotCount: 8,
  },
  {
    id: "3",
    name: "Evening Wellness",
    description: "Wellness tips and nutrition guidance",
    tags: ["Wellness", "Evening"],
    totalDuration: "2:15",
    lastUpdated: "3 days ago",
    slotCount: 6,
  },
];

const Playlists = () => {
  const [playlists, setPlaylists] = useState(mockPlaylists);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmptyState, setShowEmptyState] = useState(false);

  const handleDelete = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const handleDuplicate = (id: string) => {
    const original = playlists.find(p => p.id === id);
    if (original) {
      const duplicate = {
        ...original,
        id: `${id}-copy-${Date.now()}`,
        name: `${original.name} (Copy)`,
        lastUpdated: "Just now",
      };
      setPlaylists(prev => [duplicate, ...prev]);
    }
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const hasPlaylists = !showEmptyState && playlists.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Empty State Toggle */}
      <div className="flex items-center justify-end gap-2 mb-4 p-3 bg-muted/30 rounded-lg border border-border">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <Label htmlFor="playlist-empty-state" className="text-sm text-muted-foreground cursor-pointer">
          Show Empty State (Demo)
        </Label>
        <Switch
          id="playlist-empty-state"
          checked={showEmptyState}
          onCheckedChange={setShowEmptyState}
        />
      </div>

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
      />
    </div>
  );
};

export default Playlists;
