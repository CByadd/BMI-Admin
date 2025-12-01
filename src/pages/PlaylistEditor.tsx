import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Clock, 
  Loader2, 
  Image, 
  Video, 
  GripVertical,
  Plus,
  X,
  Upload,
  Search,
  FileVideo,
  FileImage,
  Sparkles
} from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [draggedMedia, setDraggedMedia] = useState<SlotMedia | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  // Ensure mediaLibrary is always an array using useMemo
  const safeMediaLibrary = useMemo(() => {
    try {
      if (Array.isArray(mediaLibrary)) {
        return mediaLibrary;
      }
      return [];
    } catch (error) {
      console.error('Error in safeMediaLibrary useMemo:', error);
      return [];
    }
  }, [mediaLibrary]);

  // Filter media library by search query
  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return safeMediaLibrary;
    const query = searchQuery.toLowerCase();
    return safeMediaLibrary.filter(media => 
      (media.name || '').toLowerCase().includes(query) ||
      (media.publicId || '').toLowerCase().includes(query)
    );
  }, [safeMediaLibrary, searchQuery]);

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
      
      let media = [];
      if (Array.isArray(response)) {
        media = response;
      } else if (response && Array.isArray(response.media)) {
        media = response.media;
      } else if (response && Array.isArray(response.data)) {
        media = response.data;
      } else if (response && response.ok && Array.isArray(response.media)) {
        media = response.media;
      }
      
      setMediaLibrary(media);
    } catch (error) {
      console.error('[PLAYLIST_EDITOR] Error loading media library:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load media library",
        variant: "destructive",
      });
      setMediaLibrary([]);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleMediaAdd = useCallback((slotNumber: number, media: SlotMedia) => {
    setSlots(prev => {
      const newSlots = [...prev];
      newSlots[slotNumber - 1] = media;
      return newSlots;
    });
  }, []);

  const handleMediaRemove = useCallback((slotNumber: number) => {
    setSlots(prev => {
      const newSlots = [...prev];
      newSlots[slotNumber - 1] = null;
      return newSlots;
    });
  }, []);

  const handleDurationChange = useCallback((slotNumber: number, duration: number) => {
    setSlots(prev => {
      const newSlots = [...prev];
      const slot = newSlots[slotNumber - 1];
      if (slot) {
        newSlots[slotNumber - 1] = { ...slot, duration };
      }
      return newSlots;
    });
  }, []);

  const handleDragStart = (media: SlotMedia, slotIndex?: number) => {
    setDraggedMedia(media);
    if (slotIndex !== undefined) {
      setDraggedSlot(slotIndex);
    }
  };

  const handleDragEnd = () => {
    setDraggedMedia(null);
    setDraggedSlot(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(slotIndex);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);

    if (draggedMedia) {
      handleMediaAdd(slotIndex + 1, draggedMedia);
      setDraggedMedia(null);
      setDraggedSlot(null);
    } else {
      try {
        const mediaDataString = e.dataTransfer.getData('application/json');
        if (mediaDataString) {
          const mediaData: SlotMedia = JSON.parse(mediaDataString);
          handleMediaAdd(slotIndex + 1, mediaData);
        }
      } catch (error) {
        console.error('Error handling drop:', error);
      }
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

  const handleSave = async () => {
    if (filledSlots === 0) {
      toast({
        title: "Empty playlist",
        description: "Please add at least one media item to the playlist before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!playlistName || playlistName.trim() === '') {
      toast({
        title: "Name required",
        description: "Please enter a playlist name before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      if (id && id !== "new") {
        await api.updatePlaylist(id, { name: playlistName.trim(), slots });
        toast({
          title: "Playlist saved",
          description: "Your playlist has been saved successfully.",
        });
        navigate("/playlists");
      } else {
        const response = await api.createPlaylist({
          name: playlistName.trim(),
          slots,
        }) as { ok: boolean; playlist: { id: string } };
        
        if (response.ok && response.playlist) {
          toast({
            title: "Playlist created",
            description: "Your playlist has been created successfully.",
          });
          navigate(`/playlists/${response.playlist.id}/edit`);
        } else {
          throw new Error("Failed to create playlist");
        }
      }
    } catch (error: any) {
      console.error('Error saving playlist:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save playlist",
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
    if (id && id !== "new" && playlistName.trim()) {
      api.updatePlaylist(id, { name: playlistName.trim(), slots }).catch(console.error);
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
      {/* Modern Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-4">
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/playlists")}
                  className="flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    {playlistName || "New Playlist"}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={handlePreview} 
                  disabled={filledSlots === 0}
                  className="hidden sm:flex"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={filledSlots === 0 || saving || !playlistName.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Save Playlist</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Playlist Name Input */}
            <div className="flex items-center gap-3">
              <Input
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Enter playlist name..."
                className="max-w-md h-10 text-base font-medium"
              />
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold text-foreground">{calculateTotalDuration()}</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Slots:</span>
                  <Badge variant="secondary" className="font-semibold">
                    {filledSlots}/8
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 pb-32 sm:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slots Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mobile Stats */}
            <div className="sm:hidden flex items-center justify-between p-4 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Duration:</span>
                <span className="text-sm font-semibold">{calculateTotalDuration()}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <Badge variant="secondary">
                {filledSlots}/8 slots
              </Badge>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slots.map((slot, index) => (
                <Card
                  key={index}
                  className={`relative transition-all duration-200 ${
                    dragOverSlot === index
                      ? "border-primary border-2 bg-primary/10 scale-105 shadow-lg"
                      : draggedSlot === index
                      ? "opacity-50 border-border"
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {slot ? (
                    <div className="p-4 space-y-3">
                      {/* Slot Header */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-semibold">
                          Slot {index + 1}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleMediaRemove(index + 1)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Media Preview */}
                      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
                        {slot.type === "image" ? (
                          <img
                            src={slot.url}
                            alt={slot.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <FileVideo className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Badge className="bg-black/60 text-white">
                            {slot.type === "video" ? (
                              <>
                                <Video className="w-3 h-3 mr-1" />
                                Video
                              </>
                            ) : (
                              <>
                                <Image className="w-3 h-3 mr-1" />
                                Image
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      {/* Media Info */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {slot.name}
                        </p>
                        
                        {/* Duration Control */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            {slot.type === "video" ? "Video Duration" : "Display Duration (seconds)"}
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              max="120"
                              value={slot.duration}
                              onChange={(e) => handleDurationChange(index + 1, parseInt(e.target.value) || 10)}
                              disabled={slot.type === "video"}
                              className="h-9 text-sm"
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">sec</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="p-6 flex flex-col items-center justify-center text-center min-h-[200px] cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Slot {index + 1}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Drag media here or click to browse
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Empty
                      </Badge>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Media Library Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 h-[calc(100vh-8rem)] flex flex-col">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-primary" />
                    Media Library
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={loadMediaLibrary}
                    disabled={loadingMedia}
                  >
                    {loadingMedia ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="text-xs">↻</span>
                    )}
                  </Button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Media Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingMedia ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filteredMedia.length === 0 ? (
                  <div className="text-center py-12">
                    <Image className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "No media found" : "No media available"}
                    </p>
                    {!searchQuery && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload from Media page
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredMedia.map((media) => {
                      const isImage = media.type === 'image' || media.resource_type === 'image';
                      const isVideo = media.type === 'video' || media.resource_type === 'video';
                      const mediaType = isVideo ? 'video' : 'image';
                      
                      const mediaData: SlotMedia = {
                        id: media.id || media.publicId,
                        name: media.name || 'Untitled',
                        type: mediaType,
                        url: media.url || media.secure_url,
                        duration: isVideo ? (media.duration || 30) : 10,
                        thumbnail: isImage ? (media.url || media.secure_url) : undefined,
                      };

                      return (
                        <Card
                          key={media.id || media.publicId}
                          className="group cursor-grab active:cursor-grabbing overflow-hidden border-2 border-transparent hover:border-primary transition-all hover:shadow-md"
                          draggable
                          onDragStart={(e) => {
                            handleDragStart(mediaData);
                            e.dataTransfer.setData('application/json', JSON.stringify(mediaData));
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            {isImage ? (
                              <img
                                src={media.url || media.secure_url}
                                alt={media.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                <FileVideo className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute top-1 right-1">
                              <Badge className="bg-black/60 text-white text-[10px] px-1.5 py-0.5">
                                {isVideo ? (
                                  <Video className="w-2.5 h-2.5 mr-0.5" />
                                ) : (
                                  <Image className="w-2.5 h-2.5 mr-0.5" />
                                )}
                                {mediaType}
                              </Badge>
                            </div>
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                              <GripVertical className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium text-foreground truncate">
                              {media.name || 'Untitled'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {mediaType === 'video' ? `${media.duration || 30}s` : 'Image'}
                            </p>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaylistEditor;
