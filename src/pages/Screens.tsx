import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Search, Download, Filter, Eye } from "lucide-react";
import ScreenEmptyState from "@/components/screens/ScreenEmptyState";
import ConnectScreenModal from "@/components/screens/ConnectScreenModal";
import ScreenCard from "@/components/screens/ScreenCard";

const initialScreens = [
  {
    id: "BMI-001",
    name: "Main Lobby - Floor 1",
    model: "Flow 1 - 32\" Display",
    status: "online" as const,
    location: "San Francisco, CA",
    lastSync: "2 mins ago",
    todayUsers: 45,
    totalUsers: 1234,
  },
  {
    id: "BMI-002",
    name: "Fitness Center - Floor 2",
    model: "Flow 2 - 43\" Display",
    status: "online" as const,
    location: "San Francisco, CA",
    lastSync: "5 mins ago",
    todayUsers: 38,
    totalUsers: 987,
  },
  {
    id: "BMI-003",
    name: "Health Clinic - Floor 3",
    model: "Flow 1 - 32\" Display",
    status: "offline" as const,
    location: "San Francisco, CA",
    lastSync: "2 hours ago",
    todayUsers: 0,
    totalUsers: 756,
  },
  {
    id: "BMI-004",
    name: "Employee Cafeteria",
    model: "Flow 2 - 43\" Display",
    status: "maintenance" as const,
    location: "San Francisco, CA",
    lastSync: "1 day ago",
    todayUsers: 0,
    totalUsers: 543,
  },
];

const Screens = () => {
  const [screens, setScreens] = useState(initialScreens);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEmptyState, setShowEmptyState] = useState(false);

  const handleConnectScreen = (newScreen: any) => {
    setScreens([...screens, { ...newScreen, todayUsers: 0, totalUsers: 0 }]);
  };

  const handleEditScreen = (updatedScreen: any) => {
    setScreens(screens.map(s => s.id === updatedScreen.id ? updatedScreen : s));
  };

  const handleDeleteScreen = (screenId: string) => {
    setScreens(screens.filter(s => s.id !== screenId));
  };

  const filteredScreens = screens.filter((screen) => {
    const matchesSearch = screen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         screen.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || screen.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const hasScreens = !showEmptyState && screens.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Empty State Toggle */}
      <div className="flex items-center justify-end gap-2 mb-4 p-3 bg-muted/30 rounded-lg border border-border">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <Label htmlFor="empty-state" className="text-sm text-muted-foreground cursor-pointer">
          Show Empty State (Demo)
        </Label>
        <Switch
          id="empty-state"
          checked={showEmptyState}
          onCheckedChange={setShowEmptyState}
        />
      </div>

      {!hasScreens ? (
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
              <Button 
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
              </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            </div>

            {/* Screen Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScreens.map((screen) => (
                <ScreenCard 
                  key={screen.id} 
                  screen={screen}
                  onEdit={handleEditScreen}
                  onDelete={handleDeleteScreen}
                />
              ))}
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
