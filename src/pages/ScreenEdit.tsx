import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X, Loader2, CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import api from "@/lib/api";

interface Playlist {
  id: string;
  name: string;
  description?: string;
}

const ScreenEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateScreen, refreshScreens, screens } = useData();
  
  // Find screen from context
  const screen = screens?.find(s => s.id === id);
  
  const [formData, setFormData] = useState({
    name: screen?.name || "",
    location: screen?.location || "",
    playlistId: "",
    playlistStartDate: null as Date | null,
    playlistEndDate: null as Date | null,
    isActive: screen?.status !== "offline",
    heightCalibration: null as number | null,
    heightCalibrationEnabled: true,
    paymentAmount: null as number | null,
  });
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);

  // Load playlists and current assignment when component mounts
  useEffect(() => {
    if (id) {
      loadPlaylists();
      loadCurrentPlaylist();
    }
  }, [id]);

  const loadCurrentPlaylist = async () => {
    if (!id) return;
    
    setIsLoadingData(true);
    try {
      const response = await api.getPlayer(id);
      if (response.ok && response.player) {
        const player = response.player;
        setFormData({
          name: player.deviceName || screen?.name || "",
          location: player.location || screen?.location || "",
          playlistId: player.playlistId || "none",
          playlistStartDate: player.playlistStartDate ? new Date(player.playlistStartDate) : null,
          playlistEndDate: player.playlistEndDate ? new Date(player.playlistEndDate) : null,
          isActive: player.isActive !== undefined ? player.isActive : (screen?.status !== "offline"),
          heightCalibration: player.heightCalibration !== null && player.heightCalibration !== undefined ? player.heightCalibration : null,
          heightCalibrationEnabled: player.heightCalibrationEnabled !== undefined ? player.heightCalibrationEnabled : true,
          paymentAmount: player.paymentAmount !== null && player.paymentAmount !== undefined ? player.paymentAmount : null,
        });
        // Load logo URL if exists
        if (player.logoUrl) {
          setLogoUrl(player.logoUrl);
          setLogoPreview(player.logoUrl);
        } else {
          setLogoUrl(null);
          setLogoPreview(null);
        }
      } else {
        // If API call fails, initialize with screen data
        setFormData({
          name: screen?.name || "",
          location: screen?.location || "",
          playlistId: "none",
          playlistStartDate: null,
          playlistEndDate: null,
          isActive: screen?.status !== "offline",
          heightCalibration: null,
          heightCalibrationEnabled: true,
          paymentAmount: null,
        });
        setLogoUrl(null);
        setLogoPreview(null);
        setLogoFile(null);
      }
    } catch (error) {
      console.error("Error loading current playlist:", error);
      // Initialize with screen data on error
      setFormData({
        name: screen?.name || "",
        location: screen?.location || "",
        playlistId: "none",
        playlistStartDate: null,
        playlistEndDate: null,
        isActive: screen?.status !== "offline",
        heightCalibration: null,
        paymentAmount: null,
      });
      setLogoUrl(null);
      setLogoPreview(null);
      setLogoFile(null);
    } finally {
      setIsLoadingData(false);
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

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo file must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setLogoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile || !id) {
      toast({
        title: "No file selected",
        description: "Please select a logo file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingLogo(true);
    try {
      const response = await api.uploadLogo(id, logoFile);
      if (response.ok) {
        setLogoUrl(response.logoUrl);
        setLogoPreview(response.logoUrl);
        setLogoFile(null);
        toast({
          title: "Success",
          description: "Logo uploaded successfully",
        });
        await refreshScreens();
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: error?.message || "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(logoUrl);
  };

  const handleDeleteLogo = async () => {
    if (!logoUrl || !id) {
      return;
    }

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this logo? This action cannot be undone.')) {
      return;
    }

    setIsDeletingLogo(true);
    try {
      const response = await api.deleteLogo(id);
      if (response.ok) {
        setLogoUrl(null);
        setLogoPreview(null);
        setLogoFile(null);
        toast({
          title: "Success",
          description: "Logo deleted successfully",
        });
        await refreshScreens();
      } else {
        throw new Error(response.error || 'Delete failed');
      }
    } catch (error: any) {
      console.error("Error deleting logo:", error);
      toast({
        title: "Delete failed",
        description: error?.message || "Failed to delete logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
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

      // Upload logo first if a new file is selected
      if (logoFile) {
        await handleLogoUpload();
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
        heightCalibrationEnabled: formData.heightCalibrationEnabled,
        paymentAmount: formData.paymentAmount !== null && formData.paymentAmount !== undefined ? formData.paymentAmount : null,
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
      
      const response = await api.updateScreenConfig(id, configPayload);
      console.log("Screen config update response:", response);

      // Verify playlist was saved by reloading it
      if (configPayload.playlistId) {
        const verifyResponse = await api.getPlayer(id);
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

      // Update screen in context
      if (screen) {
        const updatedScreenData = {
          ...screen,
          name: formData.name,
          location: formData.location,
          status: formData.isActive ? (screen.status === "offline" ? "online" : screen.status) : "offline",
        };
        updateScreen(id, updatedScreenData);
      }
      
      // Refresh to get latest data from server
      await refreshScreens();
      
      // Navigate back to screens list
      navigate("/screens");
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

  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Screen ID not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/screens")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Screen</h1>
            <p className="text-sm text-muted-foreground">Screen ID: {id}</p>
          </div>
        </div>

        {isLoadingData ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Skeleton loaders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Screen Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* First row: Screen Name and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Second row: Height Calibration and Payment Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="flex items-center justify-between space-x-2 pt-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="heightCalibrationEnabled" className="text-sm">Height Calibration Enabled</Label>
                        <p className="text-xs text-muted-foreground">
                          Enable height calibration validation
                        </p>
                      </div>
                      <Switch
                        id="heightCalibrationEnabled"
                        checked={formData.heightCalibrationEnabled}
                        onCheckedChange={(checked) => setFormData({ ...formData, heightCalibrationEnabled: checked })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Payment Amount (₹)</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.paymentAmount ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ 
                          ...formData, 
                          paymentAmount: value === "" ? null : (isNaN(parseFloat(value)) ? null : parseFloat(value))
                        });
                      }}
                      placeholder="Leave empty for default (₹9)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Payment amount for BMI analysis on this screen. Leave empty to use default amount (₹9).
                    </p>
                  </div>
                </div>

                {/* Logo Upload Section */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label>Screen Logo</Label>
                    {logoUrl && !logoFile && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteLogo}
                        disabled={isDeletingLogo}
                      >
                        {isDeletingLogo ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Delete Logo
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    {logoPreview && (
                      <div className="relative inline-block">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="h-32 w-auto object-contain border border-border rounded-lg p-2 bg-muted"
                        />
                        {logoFile && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={handleRemoveLogo}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          className="cursor-pointer"
                        />
                      </div>
                      {logoFile && (
                        <Button
                          type="button"
                          onClick={handleLogoUpload}
                          disabled={isUploadingLogo}
                        >
                          {isUploadingLogo ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Logo
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a logo image for this screen. The logo will be displayed at the top of modals in the Android app. Maximum file size: 5MB. Supported formats: JPG, PNG, GIF.
                    </p>
                  </div>
                </div>
                
                {/* Third row: Flow Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flowType">Flow Type</Label>
                    <Input
                      id="flowType"
                      value={screen?.flowType || "Normal"}
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      Flow type is determined by the app version and cannot be changed here
                    </p>
                  </div>
                </div>
                
                {/* Playlist Selection */}
                <div className="space-y-2">
                  <Label htmlFor="playlist">Assign Playlist</Label>
                  {isLoadingPlaylists ? (
                    <>
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </>
                  ) : (
                    <>
                      <Select 
                        value={formData.playlistId || "none"} 
                        onValueChange={(value) => setFormData({ ...formData, playlistId: value === "none" ? "" : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a playlist" />
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
                    </>
                  )}
                </div>

                {/* Date Range Configuration for Playlist */}
                {formData.playlistId && formData.playlistId !== "none" && (
                  <div className="space-y-4 pt-4 border-t">
                    <Label className="text-sm font-medium">Playlist Date Range (Optional)</Label>
                    <p className="text-xs text-muted-foreground">
                      Configure when this playlist should be active. Leave empty for always active.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                
                {/* Enable Screen Toggle */}
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

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/screens")}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
};

export default ScreenEdit;
