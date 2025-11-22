import { Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaylistEmptyStateProps {
  onCreate: () => void;
}

export const PlaylistEmptyState = ({ onCreate }: PlaylistEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
        <Play className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        No Playlists Created Yet
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Create your first playlist and start managing screen content.
      </p>
      <Button onClick={onCreate} size="lg">
        <Plus className="mr-2 h-5 w-5" />
        Add New Playlist
      </Button>
    </div>
  );
};
