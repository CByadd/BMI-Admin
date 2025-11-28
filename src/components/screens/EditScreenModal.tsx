import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface EditScreenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screen: {
    id: string;
    name: string;
    model: string;
    status: "online" | "offline" | "maintenance";
    location?: string;
    flowType?: string | null;
  };
  onSave: (updatedScreen: any) => void;
}

const EditScreenModal = ({ open, onOpenChange, screen, onSave }: EditScreenModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [formData, setFormData] = useState({
    displayName: screen.name, // Use displayName for the name field
    address: "",
    location: screen.location || "",
    flowType: screen.flowType || "Normal",
    isEnabled: true,
    playlistId: null as string | null,
    playlistStartDate: null as string | null,
    playlistEndDate: null as string | null,
  });

  // Fetch current screen data and playlists when modal opens
  useEffect(() => {
    if (open && screen.id) {
      fetchScreenData();
      fetchPlaylists();
    }
  }, [open, screen.id]);

  const fetchScreenData = async () => {
    try {
      const response = await api.getPlayer(screen.id) as { ok: boolean; player: any };
      if (response.ok && response.player) {
        setFormData({
          displayName: response.player.displayName || response.player.name || response.player.deviceName || screen.name,
          address: response.player.address || "",
          location: response.player.location || screen.location || "",
          flowType: response.player.flowType || "Normal",
          isEnabled: response.player.isEnabled !== undefined ? response.player.isEnabled : true,
          playlistId: response.player.playlistId || null,
          playlistStartDate: response.player.playlistStartDate ? new Date(response.player.playlistStartDate).toISOString().split('T')[0] : null,
          playlistEndDate: response.player.playlistEndDate ? new Date(response.player.playlistEndDate).toISOString().split('T')[0] : null,
        });
      }
    } catch (error) {
      console.error('Error fetching screen data:', error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      setLoadingPlaylists(true);
      const response = await api.getAllPlaylists() as { ok: boolean; playlists: any[] };
      if (response.ok && response.playlists) {
        setPlaylists(response.playlists);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Error",
        description: "Failed to load playlists",
        variant: "destructive",
      });
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.displayName || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Location)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.updateScreenConfig(screen.id, {
        displayName: formData.displayName,
        address: formData.address,
        location: formData.location,
        flowType: formData.flowType === "Normal" ? "" : formData.flowType,
        isEnabled: formData.isEnabled,
        playlistId: formData.playlistId,
        playlistStartDate: formData.playlistId && formData.playlistStartDate ? formData.playlistStartDate : null,
        playlistEndDate: formData.playlistId && formData.playlistEndDate ? formData.playlistEndDate : null,
      });

      toast({
        title: "Success",
        description: "Screen configuration updated successfully",
      });

      onSave({ 
        ...screen, 
        name: formData.displayName,
        displayName: formData.displayName,
        location: formData.location,
        flowType: formData.flowType,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update screen configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Screen - {screen.id}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Screen Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Enter screen name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g., 123 Main Street, City, State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-danger">*</span>
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Gym Entrance, Lobby, Reception"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flowType">
                Flow Type <span className="text-danger">*</span>
              </Label>
              <Select 
                value={formData.flowType} 
                onValueChange={(value) => setFormData({ ...formData, flowType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose operational flow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal - Standard Player</SelectItem>
                  <SelectItem value="F1">Flow 1 - Standard Measurement</SelectItem>
                  <SelectItem value="F2">Flow 2 - Enhanced Analytics</SelectItem>
                  <SelectItem value="F3">Flow 3 - Advanced Features</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="playlistId">
                Assign Playlist
              </Label>
              <Select 
                value={formData.playlistId || "none"} 
                onValueChange={(value) => {
                  const newPlaylistId = value === "none" ? null : value;
                  setFormData({ 
                    ...formData, 
                    playlistId: newPlaylistId,
                    // Clear dates if playlist is removed
                    playlistStartDate: newPlaylistId ? formData.playlistStartDate : null,
                    playlistEndDate: newPlaylistId ? formData.playlistEndDate : null,
                  });
                }}
                disabled={loadingPlaylists}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPlaylists ? "Loading playlists..." : "Select a playlist (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Playlist</SelectItem>
                  {playlists.map((playlist) => (
                    <SelectItem key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a playlist to assign to this screen. The screen will display content from the assigned playlist.
              </p>
              
              {formData.playlistId && (
                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="playlistStartDate">
                    Playlist Start Date (Optional)
                  </Label>
                  <Input
                    id="playlistStartDate"
                    type="date"
                    value={formData.playlistStartDate || ""}
                    onChange={(e) => setFormData({ ...formData, playlistStartDate: e.target.value || null })}
                  />
                  <p className="text-xs text-muted-foreground">
                    When should this playlist start playing? Leave empty for immediate start.
                  </p>
                  
                  <Label htmlFor="playlistEndDate">
                    Playlist End Date (Optional)
                  </Label>
                  <Input
                    id="playlistEndDate"
                    type="date"
                    value={formData.playlistEndDate || ""}
                    onChange={(e) => setFormData({ ...formData, playlistEndDate: e.target.value || null })}
                    min={formData.playlistStartDate || undefined}
                  />
                  <p className="text-xs text-muted-foreground">
                    When should this playlist stop playing? Leave empty for no end date.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
              <div className="space-y-0.5">
                <Label htmlFor="isEnabled" className="text-base font-medium">
                  Enable Screen
                </Label>
                <p className="text-xs text-muted-foreground">
                  {formData.isEnabled 
                    ? "Screen is enabled and will show ads" 
                    : "Screen is disabled and will only show default asset"}
                </p>
              </div>
              <Switch
                id="isEnabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditScreenModal;
