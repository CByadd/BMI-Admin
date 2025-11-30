import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, RotateCcw, SkipForward, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface PlaylistSlot {
  id?: string;
  name?: string;
  type?: "image" | "video";
  url?: string;
  asset_url?: string;
  duration: number;
}

const PlaylistPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playlistName, setPlaylistName] = useState("");
  const [slots, setSlots] = useState<PlaylistSlot[]>([]);

  useEffect(() => {
    if (id) {
      loadPlaylist();
    }
  }, [id]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const response = await api.getPlaylist(id!) as { ok: boolean; playlist: any };
      if (response.ok && response.playlist) {
        setPlaylistName(response.playlist.name || "Untitled Playlist");
        // Filter out null slots and map to preview format
        const validSlots = (response.playlist.slots || [])
          .filter((slot: any) => slot !== null && slot !== undefined)
          .map((slot: any) => ({
            id: slot.id || slot.publicId,
            name: slot.name || "Untitled",
            type: (slot.type === 'video' || slot.resource_type === 'video') ? 'video' as const : 'image' as const,
            url: slot.url || slot.asset_url || slot.secure_url,
            duration: slot.duration || 10,
          }));
        setSlots(validSlots);
        if (validSlots.length === 0) {
          toast({
            title: "No content",
            description: "This playlist has no slots filled.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
      toast({
        title: "Error",
        description: "Failed to load playlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentSlot = slots[currentSlotIndex];
  const totalSlots = slots.length;

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (currentSlot.duration * 10));
        
        if (newProgress >= 100) {
          // Move to next slot
          if (currentSlotIndex < totalSlots - 1) {
            setCurrentSlotIndex(currentSlotIndex + 1);
            return 0;
          } else {
            // Playlist complete
            setIsPlaying(false);
            return 100;
          }
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentSlotIndex, currentSlot, totalSlots]);

  const handleRestart = () => {
    setCurrentSlotIndex(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (currentSlotIndex < totalSlots - 1) {
      setCurrentSlotIndex(currentSlotIndex + 1);
      setProgress(0);
    }
  };

  const getTotalDuration = () => {
    const total = slots.reduce((sum, slot) => sum + (slot.duration || 0), 0);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (totalSlots === 0) {
    return (
      <div className="min-h-screen bg-black">
        <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate("/playlists")}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-lg font-bold text-foreground">{playlistName}</h1>
                  <p className="text-xs text-muted-foreground">No content to preview</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate(`/playlists/${id}/edit`)}>
                Back to Editor
              </Button>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center p-8" style={{ height: "calc(100vh - 200px)" }}>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">This playlist has no slots filled.</p>
            <Button className="mt-4" onClick={() => navigate(`/playlists/${id}/edit`)}>
              Edit Playlist
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/playlists")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-foreground">{playlistName}</h1>
                <p className="text-xs text-muted-foreground">
                  Slot {currentSlotIndex + 1} of {totalSlots} • Total Duration: {getTotalDuration()}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate(`/playlists/${id}/edit`)}>
              Back to Editor
            </Button>
          </div>
        </div>
      </header>

      {/* Preview Area */}
      <div className="flex items-center justify-center p-8" style={{ height: "calc(100vh - 200px)" }}>
        <Card className="w-full max-w-6xl aspect-video overflow-hidden relative">
          {currentSlot && currentSlot.type === "image" ? (
            <img
              src={currentSlot.url}
              alt={currentSlot.name || "Preview"}
              className="w-full h-full object-cover"
            />
          ) : currentSlot && currentSlot.type === "video" ? (
            <video
              src={currentSlot.url}
              className="w-full h-full object-cover"
              autoPlay={isPlaying}
              loop={false}
              onEnded={() => {
                if (currentSlotIndex < totalSlots - 1) {
                  setCurrentSlotIndex(currentSlotIndex + 1);
                  setProgress(0);
                } else {
                  setIsPlaying(false);
                  setProgress(100);
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">No content</p>
            </div>
          )}

          {/* Slot Info Overlay */}
          {currentSlot && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">{currentSlot.name || "Untitled"}</p>
              <p className="text-xs opacity-80">{currentSlot.duration}s • {currentSlot.type}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-3">
            {/* Progress Bar */}
            <Progress value={progress} className="h-2" />

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRestart}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <Button
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-1" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentSlotIndex >= totalSlots - 1}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPreview;
