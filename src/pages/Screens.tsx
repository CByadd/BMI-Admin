import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Search, Download, Filter, Eye, Loader2 } from "lucide-react";
import ScreenEmptyState from "@/components/screens/ScreenEmptyState";
import ConnectScreenModal from "@/components/screens/ConnectScreenModal";
import ScreenCard from "@/components/screens/ScreenCard";
import ScreenCardSkeleton from "@/components/screens/ScreenCardSkeleton";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import api from "@/lib/api";

interface Screen {
  id: string;
  name: string;
  model: string;
  status: "online" | "offline" | "maintenance";
  location: string;
  lastSync: string;
  todayUsers: number;
  totalUsers: number;
  flowType: string | null;
}

const Screens = () => {
  const { screens, isLoadingScreens, refreshScreens, updateScreen, removeScreen, addScreen } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEmptyState, setShowEmptyState] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Refresh screens on mount if needed (context handles caching)
    refreshScreens();
  }, [refreshScreens]);

  const handleConnectScreen = async (newScreen: any) => {
    try {
      // The actual registration happens in ConnectScreenModal
      // Refresh the list to get the new screen
      await refreshScreens();
      toast({
        title: "Success",
        description: "Screen connected successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect screen",
        variant: "destructive",
      });
    }
  };

  const handleEditScreen = async (updatedScreen: Screen) => {
    try {
      // Update the screen in context
      updateScreen(updatedScreen.id, updatedScreen);
      // Refresh to get latest data from server
      await refreshScreens();
    } catch (error) {
      console.error('Error refreshing screens:', error);
    }
  };

  const handleDeleteScreen = async (screenId: string) => {
    try {
      await api.deletePlayer(screenId);
      // Remove from context
      removeScreen(screenId);
      toast({
        title: "Success",
        description: "Screen deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete screen",
        variant: "destructive",
      });
    }
  };

  const filteredScreens = screens.filter((screen) => {
    const matchesSearch = screen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         screen.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || screen.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const hasScreens = !showEmptyState && !isLoadingScreens && screens.length > 0;

  if (isLoadingScreens && screens.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Stats Summary Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 bg-card rounded-lg border border-border">
                <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
          
          {/* Screen Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ScreenCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Empty State Toggle */}
      {/* <div className="flex items-center justify-end gap-2 mb-4 p-3 bg-muted/30 rounded-lg border border-border">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <Label htmlFor="empty-state" className="text-sm text-muted-foreground cursor-pointer">
          Show Empty State (Demo)
        </Label>
        <Switch
          id="empty-state"
          checked={showEmptyState}
          onCheckedChange={setShowEmptyState}
        />
      </div> */}

      {!hasScreens && !isLoadingScreens ? (
          <ScreenEmptyState onConnect={() => setIsModalOpen(true)} />
        ) : (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex-1 w-full sm:max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by screen name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="hidden sm:flex">
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">Export CSV</span>
                    <span className="md:hidden">Export</span>
                  </Button>
                </div>
              </div>
              {/* <Button 
                className="bg-gradient-primary hover:opacity-90 w-full sm:hidden"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Connect Screen
              </Button>
              <Button 
                className="bg-gradient-primary hover:opacity-90 hidden sm:flex sm:self-end"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Connect Screen
              </Button> */}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {isLoadingScreens && screens.length === 0 ? (
                // Show skeleton stats while loading
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 bg-card rounded-lg border border-border">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  </div>
                ))
              ) : (
                // Show actual stats
                <>
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Total Screens</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{screens.length}</p>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Online</p>
                    <p className="text-3xl font-bold text-success mt-1">
                      {screens.filter(s => s.status === "online").length}
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Offline</p>
                    <p className="text-3xl font-bold text-danger mt-1">
                      {screens.filter(s => s.status === "offline").length}
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">Maintenance</p>
                    <p className="text-3xl font-bold text-warning mt-1">
                      {screens.filter(s => s.status === "maintenance").length}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Screen Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingScreens && screens.length === 0 ? (
                // Show skeletons while loading
                Array.from({ length: 6 }).map((_, i) => (
                  <ScreenCardSkeleton key={i} />
                ))
              ) : (
                // Show actual screens
                filteredScreens.map((screen) => (
                  <ScreenCard 
                    key={screen.id} 
                    screen={screen}
                    onEdit={handleEditScreen}
                    onDelete={handleDeleteScreen}
                  />
                ))
              )}
            </div>

            {filteredScreens.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No screens found matching your filters</p>
              </div>
            )}
          </div>
        )}

        {/* Connect Screen Modal */}
        <ConnectScreenModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onConnect={handleConnectScreen}
        />
    </div>
  );
};

export default Screens;
