import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Search, Eye } from "lucide-react";
import { MediaEmptyState } from "@/components/media/MediaEmptyState";
import { UploadMediaModal } from "@/components/media/UploadMediaModal";
import { MediaCard } from "@/components/media/MediaCard";

// Mock data - replace with real data from backend
const mockMedia = [
  {
    id: "1",
    name: "Health Campaign Banner",
    type: "image" as const,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    tags: ["Health", "Campaign"],
    uploadDate: "2024-01-15",
    size: "2.4 MB",
  },
  {
    id: "2",
    name: "BMI Awareness Video",
    type: "video" as const,
    url: "",
    duration: "2:30",
    tags: ["Health", "Education"],
    uploadDate: "2024-01-14",
    size: "45.2 MB",
  },
  {
    id: "3",
    name: "Nutrition Guide",
    type: "image" as const,
    url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop",
    tags: ["Nutrition", "Guide"],
    uploadDate: "2024-01-13",
    size: "1.8 MB",
  },
];

const Media = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [mediaItems, setMediaItems] = useState(mockMedia);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const handleUploadSuccess = () => {
    // Refresh media list after successful upload
  };

  const handleDelete = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  const filteredMedia = mediaItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
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

  const hasMedia = !showEmptyState && mediaItems.length > 0;

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
