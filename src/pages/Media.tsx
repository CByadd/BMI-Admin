import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Search, Eye, Loader2 } from "lucide-react";
import { MediaEmptyState } from "@/components/media/MediaEmptyState";
import { UploadMediaModal } from "@/components/media/UploadMediaModal";
import { MediaCard } from "@/components/media/MediaCard";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  duration?: string | number;
  tags: string[];
  uploadDate: string;
  size: string | number;
  publicId?: string;
}

const Media = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await api.getAllMedia() as { ok: boolean; media: any[]; total: number };
      
      if (response.ok && response.media) {
        // Transform API response to match MediaItem interface
        const transformedMedia: MediaItem[] = response.media.map((item: any) => ({
          id: item.id || item.publicId,
          name: item.name,
          type: item.type,
          url: item.url,
          duration: item.duration ? formatDuration(item.duration) : undefined,
          tags: item.tags || [],
          uploadDate: item.uploadDate || item.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          size: formatFileSize(item.size || 0),
          publicId: item.publicId
        }));
        
        setMediaItems(transformedMedia);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({
        title: "Error",
        description: "Failed to load media",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUploadSuccess = () => {
    // Refresh media list after successful upload
    fetchMedia();
  };

  const handleDelete = async (id: string) => {
    const mediaItem = mediaItems.find(item => item.id === id);
    if (!mediaItem?.publicId) {
      toast({
        title: "Error",
        description: "Cannot delete: Missing public ID",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.deleteMedia(id, mediaItem.publicId);
      toast({
        title: "Success",
        description: "Media deleted successfully",
      });
      // Refresh media list
      await fetchMedia();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete media",
        variant: "destructive",
      });
    }
  };

  const filteredMedia = mediaItems
    .filter(item => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        item.name.toLowerCase().includes(query) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)));
      const matchesType = filterType === "all" || item.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  const hasMedia = !showEmptyState && !loading && mediaItems.length > 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Empty State Toggle */}
      <div className="flex items-center justify-end gap-2 mb-4 p-3 bg-muted/30 rounded-lg border border-border">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <Label htmlFor="media-empty-state" className="text-sm text-muted-foreground cursor-pointer">
          Show Empty State (Demo)
        </Label>
        <Switch
          id="media-empty-state"
          checked={showEmptyState}
          onCheckedChange={setShowEmptyState}
        />
      </div>

      {!hasMedia ? (
          <MediaEmptyState onUpload={() => setUploadModalOpen(true)} />
        ) : (
          <div className="space-y-6">
            {/* Controls Bar */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter by Type */}
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => setUploadModalOpen(true)} className="w-full sm:w-auto sm:self-end">
                <Upload className="mr-2 h-4 w-4" />
                Upload Media
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Total: {mediaItems.length}</span>
              <span>Images: {mediaItems.filter(m => m.type === "image").length}</span>
              <span>Videos: {mediaItems.filter(m => m.type === "video").length}</span>
            </div>

            {/* Media Grid */}
            {filteredMedia.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No media found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMedia.map((media) => (
                  <MediaCard key={media.id} media={media} onDelete={handleDelete} />
                ))}
              </div>
            )}
        </div>
      )}

      <UploadMediaModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default Media;
