import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Mock playlist data
const mockPlaylistData = {
  name: "Morning Routine Ads",
  slots: [
    {
      id: "1",
      name: "Health Banner",
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop",
      duration: 10,
    },
    {
      id: "2",
      name: "BMI Info",
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&h=1080&fit=crop",
      duration: 8,
    },
  ],
};

const PlaylistPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentSlot = mockPlaylistData.slots[currentSlotIndex];
  const totalSlots = mockPlaylistData.slots.length;

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
    const total = mockPlaylistData.slots.reduce((sum, slot) => sum + slot.duration, 0);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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
                <h1 className="text-lg font-bold text-foreground">{mockPlaylistData.name}</h1>
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
          {currentSlot.type === "image" ? (
            <img
              src={currentSlot.url}
              alt={currentSlot.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">Video Playback Placeholder</p>
            </div>
          )}

          {/* Slot Info Overlay */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
            <p className="text-sm font-medium">{currentSlot.name}</p>
            <p className="text-xs opacity-80">{currentSlot.duration}s • {currentSlot.type}</p>
          </div>
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
