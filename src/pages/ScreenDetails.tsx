import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, ArrowLeft, Edit, MapPin, Monitor, Clock, Calendar, 
  Download, Search, Users, TrendingUp, CheckCircle, ImageIcon, List
} from "lucide-react";

// Mock data - would come from API
const screenData = {
  id: "BMI-001",
  name: "Main Lobby - Floor 1",
  model: "Flow 1 - 32\" Display",
  status: "online" as const,
  location: "Main Lobby, San Francisco",
  latitude: 37.7749,
  longitude: -122.4194,
  flow: "Flow 1",
  screenSize: "32 inch / 1080x1920",
  onTime: "08:00 AM",
  runtime: "12.5 hours",
  lastSync: "2 mins ago",
  todayUsers: 45,
  totalUsers: 1234,
  avgBMI: 23.4,
  nextMaintenance: "12 Nov 2025",
};

const userLogs = [
  {
    id: 1,
    date: "2025-01-15 14:30:00",
    userName: "John Doe",
    mobile: "+1 234 567 8900",
    weight: 75,
    height: 175,
    bmi: 24.5,
    waterIntake: "2.5L",
    label: "Normal",
    city: "San Francisco",
  },
  {
    id: 2,
    date: "2025-01-15 14:15:00",
    userName: "Jane Smith",
    mobile: "+1 234 567 8901",
    weight: 68,
    height: 165,
    bmi: 25.0,
    waterIntake: "2.0L",
    label: "Overweight",
    city: "San Francisco",
  },
  {
    id: 3,
    date: "2025-01-15 13:45:00",
    userName: "Mike Johnson",
    mobile: "+1 234 567 8902",
    weight: 85,
    height: 180,
    bmi: 26.2,
    waterIntake: "3.0L",
    label: "Overweight",
    city: "San Francisco",
  },
  {
    id: 4,
    date: "2025-01-15 13:20:00",
    userName: "Sarah Williams",
    mobile: "+1 234 567 8903",
    weight: 62,
    height: 168,
    bmi: 22.0,
    waterIntake: "2.2L",
    label: "Normal",
    city: "San Francisco",
  },
];

const labelColors: Record<string, string> = {
  Normal: "bg-success/10 text-success border-success/20",
  Overweight: "bg-warning/10 text-warning border-warning/20",
  Obese: "bg-danger/10 text-danger border-danger/20",
  Underweight: "bg-info/10 text-info border-info/20",
};

const ScreenDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("today");

  const filteredLogs = userLogs.filter((log) =>
    log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.mobile.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigate("/screens")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{screenData.name}</h1>
                <p className="text-xs text-muted-foreground">{screenData.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/media")}
                className="flex-1 sm:flex-none"
              >
                <ImageIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Media</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/playlists")}
                className="flex-1 sm:flex-none"
              >
                <List className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Playlists</span>
              </Button>
              <Badge className={screenData.status === "online" ? "bg-success/10 text-success border-success/20" : ""}>
                <div className="w-2 h-2 rounded-full bg-success mr-2" />
                Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Monitoring Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{screenData.todayUsers}</p>
                <p className="text-xs text-muted-foreground">Users Today</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-success/20 bg-gradient-to-br from-success/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{screenData.avgBMI}</p>
                <p className="text-xs text-muted-foreground">Avg BMI Today</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-info/20 bg-gradient-to-br from-info/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{screenData.runtime}</p>
                <p className="text-xs text-muted-foreground">Runtime Today</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-warning/20 bg-gradient-to-br from-warning/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{screenData.nextMaintenance}</p>
                <p className="text-xs text-muted-foreground">Next Maintenance</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Screen Information */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Screen Information</h2>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Info
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Screen Name</p>
                <p className="font-medium text-foreground">{screenData.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Screen ID</p>
                <p className="font-medium text-foreground">{screenData.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Model Type</p>
                <p className="font-medium text-foreground">{screenData.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Screen Size & Resolution</p>
                <p className="font-medium text-foreground">{screenData.screenSize}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Selected Flow</p>
                <p className="font-medium text-foreground">{screenData.flow}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <p className="font-medium text-foreground">{screenData.location}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {screenData.latitude}, {screenData.longitude}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Screen On-Time</p>
                <p className="font-medium text-foreground">{screenData.onTime}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Sync</p>
                <p className="font-medium text-foreground">{screenData.lastSync}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* User Logs Section */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">User Activity Logs</h2>
                <p className="text-sm text-muted-foreground">Complete measurement history for this screen</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mobile</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Weight (kg)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Height (cm)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">BMI</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Water Intake</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-foreground">{log.date}</td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{log.userName}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{log.mobile}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{log.weight}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{log.height}</td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{log.bmi}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{log.waterIntake}</td>
                        <td className="px-4 py-3">
                          <Badge className={labelColors[log.label]}>{log.label}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No user logs found</p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ScreenDetails;
