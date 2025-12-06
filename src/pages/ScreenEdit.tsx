import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const ScreenEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [screenData, setScreenData] = useState({ name: "", location: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchScreenData = async () => {
      try {
        const response = await api.getPlayer(id!);
        if (response.ok) {
          setScreenData({
            name: response.player.deviceName,
            location: response.player.location,
          });
        }
      } catch (error) {
        console.error("Error fetching screen data:", error);
        toast({
          title: "Error",
          description: "Failed to load screen data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchScreenData();
    }
  }, [id, toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Assuming you have an API endpoint to update the screen
      await api.put(`/api/screens/${id}`, screenData);
      toast({
        title: "Success",
        description: "Screen information updated successfully.",
      });
      navigate(`/screens/${id}`);
    } catch (error) {
      console.error("Error saving screen data:", error);
      toast({
        title: "Error",
        description: "Failed to save screen data",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setScreenData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => navigate(`/screens/${id}`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold">Edit Screen</h1>
      </div>
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">
              Screen Name
            </label>
            <Input id="name" name="name" value={screenData.name} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-muted-foreground mb-2">
              Location
            </label>
            <Input id="location" name="location" value={screenData.location} onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate(`/screens/${id}`)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScreenEdit;
