import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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

interface Playlist {
  id: string;
  name: string;
  description?: string;
}

const EditScreenModal = ({ open, onOpenChange, screen, onSave }: EditScreenModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: screen.name,
    location: screen.location || "",
    playlistId: "",
    playlistStartDate: null as Date | null,
    playlistEndDate: null as Date | null,
    isActive: screen.status !== "offline",
    heightCalibration: null as number | null,
  });
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load playlists and current assignment when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: screen.name,
        location: screen.location || "",
        playlistId: "",
        playlistStartDate: null,
        playlistEndDate: null,
        isActive: screen.status !== "offline",
        heightCalibration: null,
      });
      loadPlaylists();
      loadCurrentPlaylist();
    }
  }, [screen, open]);

  const loadCurrentPlaylist = async () => {
    try {
      const response = await api.getPlayer(screen.id);
      if (response.ok && response.player) {
        const player = response.player;
        setFormData(prev => ({
          ...prev,
          playlistId: player.playlistId || "none",
          playlistStartDate: player.playlistStartDate ? new Date(player.playlistStartDate) : null,
          playlistEndDate: player.playlistEndDate ? new Date(player.playlistEndDate) : null,
          heightCalibration: player.heightCalibration && player.heightCalibration !== 0 ? player.heightCalibration : null,
        }));
      }
    } catch (error) {
      console.error("Error loading current playlist:", error);
      // Don't show error toast, just use default
    }
  };

  const loadPlaylists = async () => {
    setIsLoadingPlaylists(true);
    try {
      const response = await api.getAllPlaylists() as { ok: boolean; playlists: Playlist[] };
      if (response.ok && response.playlists) {
        setPlaylists(response.playlists);
      }
    } catch (error) {
      console.error("Error loading playlists:", error);
      toast({
        title: "Error",
        description: "Failed to load playlists",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Validate date range if both dates are provided
      if (formData.playlistStartDate && formData.playlistEndDate && formData.playlistEndDate < formData.playlistStartDate) {
        toast({
          title: "Error",
          description: "End date must be after start date",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Update screen configuration via API (without flowType - it's static)
      // Include playlistId and date range in the update
      const playlistIdToSend = formData.playlistId && formData.playlistId !== "none" ? formData.playlistId : null;
      
      // Prepare date values - always send them (null if not set)
      const configPayload: any = {
        deviceName: formData.name,
        location: formData.location,
        isActive: formData.isActive,
        heightCalibration: formData.heightCalibration !== null && formData.heightCalibration !== undefined ? formData.heightCalibration : 0,
      };
      
      // Always include playlist fields - send null to clear, or values to set
      // IMPORTANT: Always send playlistId (even if null) so backend knows to process it
      configPayload.playlistId = playlistIdToSend;
      configPayload.playlistStartDate = formData.playlistStartDate ? formData.playlistStartDate.toISOString() : null;
      configPayload.playlistEndDate = formData.playlistEndDate ? formData.playlistEndDate.toISOString() : null;
      
      console.log("Saving screen config:", configPayload);
      console.log("Playlist assignment details:", {
        playlistId: configPayload.playlistId,
        playlistStartDate: configPayload.playlistStartDate,
        playlistEndDate: configPayload.playlistEndDate,
        hasPlaylist: !!configPayload.playlistId
      });
      
      const response = await api.updateScreenConfig(screen.id, configPayload);
      console.log("Screen config update response:", response);

      // Verify playlist was saved by reloading it
      if (configPayload.playlistId) {
        const verifyResponse = await api.getPlayer(screen.id);
        console.log("Verification - current playlist assignment:", verifyResponse.player?.playlistId);
        
        if (verifyResponse.player?.playlistId !== configPayload.playlistId) {
          console.warn("WARNING: Playlist assignment may not have saved correctly!");
          toast({
            title: "Warning",
            description: "Screen updated but playlist assignment may not have saved. Please check.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Screen and playlist assignment updated successfully",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Screen updated successfully",
        });
      }

      // Call onSave with updated data
      onSave({
        ...screen,
        name: formData.name,
        location: formData.location,
        status: formData.isActive ? (screen.status === "offline" ? "online" : screen.status) : "offline",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating screen:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update screen",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
              <Label htmlFor="name">Screen Name (Device Name)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter screen name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heightCalibration">Height Calibration (cm)</Label>
              <Input
                id="heightCalibration"
                type="number"
                step="0.1"
                value={formData.heightCalibration ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ 
                    ...formData, 
                    heightCalibration: value === "" ? null : (isNaN(parseFloat(value)) ? null : parseFloat(value))
                  });
                }}
                placeholder="Leave empty for default (0)"
              />
              <p className="text-xs text-muted-foreground">
                Height calibration offset in cm. This value will be added/subtracted from sensor readings before BMI calculation. Use positive values to add, negative to subtract. Leave empty to use default (0).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="flowType">Flow Type</Label>
              <Input
                id="flowType"
                value={screen.flowType || "Normal"}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Flow type is determined by the app version and cannot be changed here
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="playlist">Assign Playlist</Label>
              <Select 
                value={formData.playlistId || "none"} 
                onValueChange={(value) => setFormData({ ...formData, playlistId: value === "none" ? "" : value })}
                disabled={isLoadingPlaylists}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingPlaylists ? "Loading playlists..." : "Select a playlist"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (No playlist assigned)</SelectItem>
                  {playlists.map((playlist) => (
                    <SelectItem key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a playlist to assign to this screen
              </p>
            </div>

            {/* Date Range Configuration for Playlist */}
            {formData.playlistId && formData.playlistId !== "none" && (
              <div className="space-y-4 pt-2 border-t border-border">
                <Label className="text-sm font-medium">Playlist Date Range (Optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Configure when this playlist should be active. Leave empty for always active.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                      {formData.playlistStartDate && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setFormData({ ...formData, playlistStartDate: null })}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.playlistStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.playlistStartDate ? (
                            format(formData.playlistStartDate, "PPP")
                          ) : (
                            <span>Pick a start date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.playlistStartDate || undefined}
                          onSelect={(date) => setFormData({ ...formData, playlistStartDate: date || null })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="endDate" className="text-xs">End Date</Label>
                      {formData.playlistEndDate && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setFormData({ ...formData, playlistEndDate: null })}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.playlistEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.playlistEndDate ? (
                            format(formData.playlistEndDate, "PPP")
                          ) : (
                            <span>Pick an end date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.playlistEndDate || undefined}
                          onSelect={(date) => setFormData({ ...formData, playlistEndDate: date || null })}
                          initialFocus
                          disabled={(date) => {
                            if (formData.playlistStartDate) {
                              return date < formData.playlistStartDate;
                            }
                            return false;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {formData.playlistStartDate && formData.playlistEndDate && formData.playlistEndDate < formData.playlistStartDate && (
                  <p className="text-xs text-destructive">
                    End date must be after start date
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center justify-between space-x-2 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Enable Screen</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this screen
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditScreenModal;
