import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaEmptyStateProps {
  onUpload: () => void;
}

export const MediaEmptyState = ({ onUpload }: MediaEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Upload className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        No Media Assets Yet
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Upload images or videos to build your playlists and run engaging campaigns.
      </p>
      <Button onClick={onUpload} size="lg">
        <Upload className="mr-2 h-5 w-5" />
        Upload Media
      </Button>
    </div>
  );
};
