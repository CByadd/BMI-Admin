import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Eye, Clock, AlertCircle, Loader2, Image, Video, GripVertical } from "lucide-react";
import { PlaylistSlot } from "@/components/playlist/PlaylistSlot";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // Ensure mediaLibrary is always an array using useMemo
  const safeMediaLibrary = useMemo(() => {
    try {
      if (Array.isArray(mediaLibrary)) {
        return mediaLibrary;
      }
      console.warn('mediaLibrary is not an array:', mediaLibrary, typeof mediaLibrary);
      return [];
    } catch (error) {
      console.error('Error in safeMediaLibrary useMemo:', error);
      return [];
    }
  }, [mediaLibrary]);

  useEffect(() => {
    if (id && id !== "new") {
      loadPlaylist();
    } else {
      setLoading(false);
    }
    loadMediaLibrary();
  }, [id]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const response = await api.getPlaylist(id!) as { ok: boolean; playlist: any };
      if (response.ok && response.playlist) {
        setPlaylistName(response.playlist.name);
        setSlots(response.playlist.slots || Array(8).fill(null));
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

  const loadMediaLibrary = async () => {
    try {
      setLoadingMedia(true);
      const response = await api.getAllMedia();
      // Handle different response formats
      let media = [];
      if (Array.isArray(response)) {
        media = response;
      } else if (response && Array.isArray(response.media)) {
        media = response.media;
      } else if (response && Array.isArray(response.data)) {
        media = response.data;
      } else {
        console.warn('Unexpected media response format:', response);
        media = [];
      }
      setMediaLibrary(media);
    } catch (error) {
      console.error('Error loading media library:', error);
      toast({
        title: "Error",
        description: "Failed to load media library",
        variant: "destructive",
      });
      setMediaLibrary([]);
    } finally {
      setLoadingMedia(false);
    }
  };

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

  const handleSave = async () => {
    if (!isComplete) {
      toast({
        title: "Incomplete playlist",
        description: "Please fill all 8 slots before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      if (id && id !== "new") {
        await api.updatePlaylist(id, { slots });
      } else {
        toast({
          title: "Error",
          description: "Cannot save new playlist without name. Please create playlist first.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Playlist saved",
        description: "Your playlist has been saved successfully.",
      });
      navigate("/playlists");
    } catch (error) {
      console.error('Error saving playlist:', error);
      toast({
        title: "Error",
        description: "Failed to save playlist",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                <h1 className="text-lg sm:text-xl font-bold text-foreground">{playlistName || "Edit Playlist"}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Configure your 8-slot content sequence</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={handlePreview} className="flex-1 sm:flex-none">
                <Eye className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button onClick={handleSave} disabled={!isComplete || saving} className="flex-1 sm:flex-none">
                <Save className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{saving ? "Saving..." : "Save Playlist"}</span>
                <span className="sm:hidden">{saving ? "Saving..." : "Save"}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-80">
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
                <li>• Drag assets from your media library below or upload new files</li>
                <li>• Set display duration for images (videos use actual length)</li>
                <li>• Preview your playlist before saving</li>
                <li>• Total duration is calculated automatically</li>
              </ul>
            </Card>
          )}

          {/* Media Library Section - Fixed at Bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Media Library</h3>
                    <p className="text-sm text-muted-foreground">Drag and drop assets to slots above</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMediaLibrary}
                    disabled={loadingMedia}
                  >
                    {loadingMedia ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Refresh"
                    )}
                  </Button>
                </div>

                {loadingMedia ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : safeMediaLibrary.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No media found. Upload assets from the Media page.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 max-h-48 overflow-y-auto">
                    {Array.isArray(safeMediaLibrary) ? safeMediaLibrary.map((media) => {
                      const isImage = media.type === 'image' || media.resource_type === 'image';
                      const isVideo = media.type === 'video' || media.resource_type === 'video';
                      const mediaType = isVideo ? 'video' : 'image';
                      
                      return (
                        <Card
                          key={media.id || media.publicId}
                          className="relative group cursor-grab active:cursor-grabbing overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                          draggable
                          onDragStart={(e) => {
                            const mediaData: SlotMedia = {
                              id: media.id || media.publicId,
                              name: media.name || 'Untitled',
                              type: mediaType,
                              url: media.url || media.secure_url,
                              duration: isVideo ? (media.duration || 30) : 10,
                              thumbnail: isImage ? (media.url || media.secure_url) : undefined,
                            };
                            e.dataTransfer.setData('application/json', JSON.stringify(mediaData));
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                        >
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            {isImage ? (
                              <img
                                src={media.url || media.secure_url}
                                alt={media.name}
                                className="w-full h-full object-cover"
                              />
                            ) : isVideo ? (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <Video className="w-8 h-8 text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <Image className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2">
                              <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1">
                                <GripVertical className="w-3 h-3 text-white" />
                                {isVideo ? (
                                  <Video className="w-3 h-3 text-white" />
                                ) : (
                                  <Image className="w-3 h-3 text-white" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium text-foreground truncate">
                              {media.name || 'Untitled'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {mediaType === 'video' ? `${media.duration || 30}s` : 'Image'}
                            </p>
                          </div>
                        </Card>
                      );
                    }) : null}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaylistEditor;
