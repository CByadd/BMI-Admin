import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Loader2 } from "lucide-react";
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
        // Filter out null/empty slots and map to preview format
        // Empty slots are skipped during playback
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
    if (!isPlaying || !currentSlot) return;

    // Reset progress when slot changes
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (currentSlot.duration * 10));
        
        if (newProgress >= 100) {
          // Move to next slot
          if (currentSlotIndex < totalSlots - 1) {
            setCurrentSlotIndex(currentSlotIndex + 1);
            return 0;
          } else {
            // Playlist complete - loop back to start
            setCurrentSlotIndex(0);
            return 0;
          }
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentSlotIndex, currentSlot, totalSlots]);

  const handleNext = () => {
    if (currentSlotIndex < totalSlots - 1) {
      setCurrentSlotIndex(currentSlotIndex + 1);
      setProgress(0);
    } else {
      // Loop back to start
      setCurrentSlotIndex(0);
      setProgress(0);
    }
  };

  const handlePrevious = () => {
    if (currentSlotIndex > 0) {
      setCurrentSlotIndex(currentSlotIndex - 1);
      setProgress(0);
    } else {
      // Loop to end
      setCurrentSlotIndex(totalSlots - 1);
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
    <div className="bg-black overflow-hidden" style={{ height: '100vh', maxHeight: '100vh', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Minimal Header - Android TV Style */}
      <header className="bg-black/60 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/playlists")}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-sm font-medium text-white">{playlistName}</h1>
                <p className="text-xs text-white/60">
                  {currentSlotIndex + 1}/{totalSlots}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/playlists/${id}/edit`)}
              className="text-white hover:bg-white/10"
            >
              Edit
            </Button>
          </div>
        </div>
      </header>

      {/* Preview Area - Portrait TV Frame */}
      <div 
        className="flex items-center justify-center gap-4 p-4 sm:p-6 overflow-hidden" 
        style={{ 
          height: "calc(100vh - 100px)", 
          maxHeight: "calc(100vh - 100px)",
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* TV Frame - 9:16 Portrait Aspect Ratio */}
        <div className="relative h-full flex items-center justify-center" style={{ aspectRatio: '9/16', maxWidth: '100%' }}>
          {/* TV Frame Outer */}
          <div className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-2xl h-full flex items-center justify-center border-2 border-white">
            {/* TV Bezel */}
            <div className="bg-black rounded-md sm:rounded-lg p-1.5 sm:p-2 relative h-full w-full flex items-center justify-center border border-white/30">
              {/* Screen Content - 9:16 Portrait Aspect Ratio */}
              <div 
                className="relative w-full h-full bg-black rounded overflow-hidden flex items-center justify-center" 
                style={{ 
                  aspectRatio: '9/16'
                }}
              >
                {currentSlot && currentSlot.type === "image" ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <img
                      src={currentSlot.url}
                      alt={currentSlot.name || "Preview"}
                      className="max-w-full max-h-full object-contain"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                ) : currentSlot && currentSlot.type === "video" ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={currentSlot.url}
                      className="max-w-full max-h-full object-contain"
                      autoPlay={isPlaying}
                      loop={false}
                      muted={false}
                      playsInline
                      style={{ objectFit: 'contain' }}
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
                  </div>
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <p className="text-white/40">No content</p>
                  </div>
                )}
              </div>
              
              {/* TV Brand/Logo area (bottom center) */}
              <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 z-10">
                <div className="h-0.5 w-12 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Controls - Right Side */}
        <div className="flex flex-col items-center justify-center gap-4 px-2">
          {/* Previous Button */}
          <Button
            size="lg"
            onClick={handlePrevious}
            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
            variant="ghost"
          >
            <SkipBack className="w-5 h-5 text-white" />
          </Button>

          {/* Circular Progress with Play/Pause Button */}
          <div className="relative w-20 h-20">
            {/* Circular Progress Ring */}
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
              {/* Background Circle */}
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="4"
              />
              {/* Progress Circle */}
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 35}`}
                strokeDashoffset={`${2 * Math.PI * 35 * (1 - progress / 100)}`}
                className="transition-all duration-100"
              />
            </svg>
            {/* Play/Pause Button in Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                variant="ghost"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Next Button */}
          <Button
            size="lg"
            onClick={handleNext}
            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
            variant="ghost"
          >
            <SkipForward className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPreview;
