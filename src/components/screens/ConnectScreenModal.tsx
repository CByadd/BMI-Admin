import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConnectScreenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (screenData: any) => void;
}

const ConnectScreenModal = ({ open, onOpenChange, onConnect }: ConnectScreenModalProps) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({
    screenId: "",
    screenName: "",
    model: "",
    latitude: "",
    longitude: "",
    flow: "",
    notes: "",
  });

  const handleVerify = () => {
    if (!formData.screenId) {
      toast({
        title: "Validation Error",
        description: "Please enter a Screen ID",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    // Simulate API verification
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      toast({
        title: "Screen ID Verified",
        description: "Screen ID exists in the system registry",
      });
    }, 1500);
  };

  const handleConnect = () => {
    // Validate required fields
    if (!formData.screenId || !formData.screenName || !formData.model || !formData.flow) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!isVerified) {
      toast({
        title: "Verification Required",
        description: "Please verify the Screen ID first",
        variant: "destructive",
      });
      return;
    }

    // Create screen data
    const newScreen = {
      id: formData.screenId,
      name: formData.screenName,
      model: formData.model,
      latitude: formData.latitude,
      longitude: formData.longitude,
      flow: formData.flow,
      notes: formData.notes,
      status: "online",
      lastSync: "Just now",
      connectedAt: new Date().toISOString(),
    };

    onConnect(newScreen);
    
    toast({
      title: "Screen Connected Successfully",
      description: `${formData.screenName} is now connected and monitoring`,
    });

    // Reset form
    setFormData({
      screenId: "",
      screenName: "",
      model: "",
      latitude: "",
      longitude: "",
      flow: "",
      notes: "",
    });
    setIsVerified(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect New Screen</DialogTitle>
          <DialogDescription>
            Enter the screen details to connect a new BMI kiosk to the system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Screen ID with Verify */}
          <div className="space-y-2">
            <Label htmlFor="screenId">
              Screen ID <span className="text-danger">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="screenId"
                placeholder="e.g., BMI-005"
                value={formData.screenId}
                onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
                disabled={isVerified}
              />
              <Button
                onClick={handleVerify}
                disabled={isVerifying || isVerified}
                variant={isVerified ? "default" : "outline"}
                className="min-w-[100px]"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying
                  </>
                ) : isVerified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Verified
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Unique screen identifier provided by hardware or IoT system
            </p>
          </div>

          {/* Screen Name */}
          <div className="space-y-2">
            <Label htmlFor="screenName">
              Screen Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="screenName"
              placeholder="e.g., Well2Day Gym Entrance"
              value={formData.screenName}
              onChange={(e) => setFormData({ ...formData, screenName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Custom name for easy identification
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">
              Select Model <span className="text-danger">*</span>
            </Label>
            <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose model type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flow1-32">Flow 1 - 32" Display</SelectItem>
                <SelectItem value="flow1-43">Flow 1 - 43" Display</SelectItem>
                <SelectItem value="flow2-32">Flow 2 - 32" Display</SelectItem>
                <SelectItem value="flow2-43">Flow 2 - 43" Display</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="e.g., 37.7749"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="e.g., -122.4194"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>

          {/* Flow Selection */}
          <div className="space-y-2">
            <Label htmlFor="flow">
              Select Flow <span className="text-danger">*</span>
            </Label>
            <Select value={formData.flow} onValueChange={(value) => setFormData({ ...formData, flow: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose operational flow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flow1">Flow 1 - Standard Measurement</SelectItem>
                <SelectItem value="flow2">Flow 2 - Enhanced Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Add Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Admin notes, maintenance info, or remarks..."
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConnect}
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
