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
  const [formData, setFormData] = useState({
    name: screen.name,
    location: screen.location || "",
    flowType: screen.flowType || "Normal",
    isActive: screen.status !== "offline",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Update form data when screen prop changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: screen.name,
        location: screen.location || "",
        flowType: screen.flowType || "Normal",
        isActive: screen.status !== "offline",
      });
    }
  }, [screen, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Update screen configuration via API
      const normalizedFlowType = formData.flowType === "Normal" ? null : formData.flowType;
      
      await api.updateScreenConfig(screen.id, {
        deviceName: formData.name,
        location: formData.location,
        flowType: normalizedFlowType,
        isActive: formData.isActive,
      });

      toast({
        title: "Success",
        description: "Screen updated successfully",
      });

      // Call onSave with updated data
      onSave({
        ...screen,
        name: formData.name,
        location: formData.location,
        flowType: normalizedFlowType,
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
              <Label htmlFor="flowType">Flow Type</Label>
              <Select 
                value={formData.flowType} 
                onValueChange={(value) => setFormData({ ...formData, flowType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="F1">F1</SelectItem>
                  <SelectItem value="F2">F2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between space-x-2 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Status</Label>
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
