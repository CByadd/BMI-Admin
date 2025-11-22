import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface ConnectScreenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (screenData: any) => void;
}

const ConnectScreenModal = ({ open, onOpenChange, onConnect }: ConnectScreenModalProps) => {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [isFound, setIsFound] = useState(false);
  const [registrationCode, setRegistrationCode] = useState("");
  const [formData, setFormData] = useState({
    screenId: "",
    name: "",
    address: "",
    location: "",
    flowType: "",
    isEnabled: true,
    screenWidth: 0,
    screenHeight: 0,
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setRegistrationCode("");
      setIsFound(false);
      setFormData({
        screenId: "",
        name: "",
        address: "",
        location: "",
        flowType: "",
        isEnabled: true,
        screenWidth: 0,
        screenHeight: 0,
      });
    }
  }, [open]);

  const handleSearch = async () => {
    if (!registrationCode || registrationCode.length !== 8) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 8-digit registration code",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.getPlayerByCode(registrationCode) as { ok: boolean; player: any };
      
      if (response.ok && response.player) {
        const player = response.player;
        setFormData({
          screenId: player.screenId,
          name: player.name || player.deviceName || "",
          address: player.address || "",
          location: player.location || "",
          flowType: player.flowType || "Normal",
          isEnabled: player.isEnabled !== undefined ? player.isEnabled : true,
          screenWidth: player.screenWidth || 0,
          screenHeight: player.screenHeight || 0,
        });
        setIsFound(true);
        toast({
          title: "Screen Found",
          description: `Screen ${player.screenId} found. Screen size: ${player.screenWidth || 'Unknown'}x${player.screenHeight || 'Unknown'}`,
        });
      } else {
        throw new Error("Screen not found");
      }
    } catch (error: any) {
      toast({
        title: "Screen Not Found",
        description: error.message || "No screen found with this registration code. Make sure the app is running and has generated a code.",
        variant: "destructive",
      });
      setIsFound(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConnect = async () => {
    // Validate required fields
    if (!formData.name || !formData.location || !formData.flowType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Location, Flow Type)",
        variant: "destructive",
      });
      return;
    }

    if (!isFound) {
      toast({
        title: "Search Required",
        description: "Please search for a screen using the registration code first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update screen configuration
      await api.updateScreenConfig(formData.screenId, {
        name: formData.name,
        address: formData.address,
        location: formData.location,
        flowType: formData.flowType === "Normal" ? "" : formData.flowType,
        isEnabled: formData.isEnabled,
      });

      const newScreen = {
        id: formData.screenId,
        name: formData.name,
        model: `Flow ${formData.flowType || 'Normal'} - ${formData.screenWidth}x${formData.screenHeight} Display`,
        status: "online",
        lastSync: "Just now",
        connectedAt: new Date().toISOString(),
        flowType: formData.flowType,
        isEnabled: formData.isEnabled,
      };

      onConnect(newScreen);
      
      toast({
        title: "Screen Connected Successfully",
        description: `${formData.name} is now connected and configured`,
      });

      // Reset form
      setRegistrationCode("");
      setIsFound(false);
      setFormData({
        screenId: "",
        name: "",
        address: "",
        location: "",
        flowType: "",
        isEnabled: true,
        screenWidth: 0,
        screenHeight: 0,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to connect screen",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect New Screen</DialogTitle>
          <DialogDescription>
            Enter the 8-digit registration code from the app to connect a new screen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Registration Code Search */}
          <div className="space-y-2">
            <Label htmlFor="registrationCode">
              Registration Code (8 digits) <span className="text-danger">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="registrationCode"
                placeholder="Enter 8-digit code"
                value={registrationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setRegistrationCode(value);
                  if (value.length !== 8) {
                    setIsFound(false);
                  }
                }}
                disabled={isSearching || isFound}
                maxLength={8}
                className="font-mono text-lg tracking-wider"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || isFound || registrationCode.length !== 8}
                variant={isFound ? "default" : "outline"}
                className="min-w-[120px]"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching
                  </>
                ) : isFound ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Found
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the 8-digit code displayed on the app screen. The screen size will be automatically detected.
            </p>
          </div>

          {isFound && (
            <>
              {/* Screen Info (Read-only) */}
              <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Screen ID:</span>
                    <p className="font-mono font-semibold">{formData.screenId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Screen Size:</span>
                    <p className="font-semibold">
                      {formData.screenWidth && formData.screenHeight
                        ? `${formData.screenWidth} × ${formData.screenHeight}`
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Screen Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Screen Name <span className="text-danger">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Well2Day Gym Entrance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Custom name for easy identification
                </p>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., 123 Main Street, City, State"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Physical address of the screen location
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-danger">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., Gym Entrance, Lobby, Reception"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Location description within the venue
                </p>
              </div>

              {/* Flow Type Selection */}
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
                <p className="text-xs text-muted-foreground">
                  Select the operational flow type for this screen
                </p>
              </div>

              {/* Enable/Disable Toggle */}
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
            </>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConnect}
            disabled={!isFound}
            className="bg-gradient-primary hover:opacity-90"
          >
            Connect Screen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectScreenModal;
