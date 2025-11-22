import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Eye, Clock, AlertCircle } from "lucide-react";
import { PlaylistSlot } from "@/components/playlist/PlaylistSlot";
import { toast } from "@/hooks/use-toast";

interface SlotMedia {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  duration: number;
  thumbnail?: string;
}

const PlaylistEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<(SlotMedia | null)[]>(Array(8).fill(null));

  const handleMediaAdd = (slotNumber: number, media: SlotMedia) => {
    const newSlots = [...slots];
    newSlots[slotNumber - 1] = media;
    setSlots(newSlots);
  };

  const handleMediaRemove = (slotNumber: number) => {
    const newSlots = [...slots];
    newSlots[slotNumber - 1] = null;
    setSlots(newSlots);
  };

  const handleDurationChange = (slotNumber: number, duration: number) => {
    const newSlots = [...slots];
    const slot = newSlots[slotNumber - 1];
    if (slot) {
      newSlots[slotNumber - 1] = { ...slot, duration };
      setSlots(newSlots);
    }
  };

  const calculateTotalDuration = () => {
    const totalSeconds = slots.reduce((sum, slot) => {
      return sum + (slot?.duration || 0);
    }, 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const filledSlots = slots.filter(slot => slot !== null).length;
  const isComplete = filledSlots === 8;

  const handleSave = () => {
    if (!isComplete) {
      toast({
        title: "Incomplete playlist",
        description: "Please fill all 8 slots before saving.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Playlist saved",
      description: "Your playlist has been saved successfully.",
    });
    navigate("/playlists");
  };

  const handlePreview = () => {
    if (filledSlots === 0) {
      toast({
        title: "No content to preview",
        description: "Add at least one media item to preview.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/playlists/${id}/preview`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/playlists")}
                className="flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-foreground">Edit Playlist</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Configure your 8-slot content sequence</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={handlePreview} className="flex-1 sm:flex-none">
                <Eye className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button onClick={handleSave} disabled={!isComplete} className="flex-1 sm:flex-none">
                <Save className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Save Playlist</span>
                <span className="sm:hidden">Save</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Status Banner */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Duration</p>
                    <p className="text-2xl font-bold text-foreground">{calculateTotalDuration()}</p>
                  </div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <p className="text-sm text-muted-foreground">Slots Filled</p>
                  <p className="text-2xl font-bold text-foreground">
                    {filledSlots}/8
                  </p>
                </div>
              </div>
              
              {!isComplete && (
                <div className="flex items-center gap-2 text-warning">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {8 - filledSlots} slot{8 - filledSlots !== 1 ? 's' : ''} remaining
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* 8 Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((slotNumber) => (
              <PlaylistSlot
                key={slotNumber}
                slotNumber={slotNumber}
                media={slots[slotNumber - 1]}
                onMediaAdd={handleMediaAdd}
                onMediaRemove={handleMediaRemove}
                onDurationChange={handleDurationChange}
              />
            ))}
          </div>

          {/* Instructions */}
          {filledSlots === 0 && (
            <Card className="p-6 bg-muted/50">
              <h3 className="font-semibold text-foreground mb-2">Getting Started</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Each playlist requires exactly 8 content slots</li>
                <li>• Drag assets from your media library or upload new files</li>
                <li>• Set display duration for images (videos use actual length)</li>
                <li>• Preview your playlist before saving</li>
                <li>• Total duration is calculated automatically</li>
              </ul>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlaylistEditor;
