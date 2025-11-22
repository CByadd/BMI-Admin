import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Circle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const screens = [
  {
    id: "BMI-001",
    location: "Main Lobby - Floor 1",
    status: "online",
    lastSync: "2 mins ago",
    todayData: 45,
    totalData: 1234,
  },
  {
    id: "BMI-002",
    location: "Fitness Center - Floor 2",
    status: "online",
    lastSync: "5 mins ago",
    todayData: 38,
    totalData: 987,
  },
  {
    id: "BMI-003",
    location: "Health Clinic - Floor 3",
    status: "offline",
    lastSync: "2 hours ago",
    todayData: 0,
    totalData: 756,
  },
  {
    id: "BMI-004",
    location: "Employee Cafeteria",
    status: "maintenance",
    lastSync: "1 day ago",
    todayData: 0,
    totalData: 543,
  },
];

const statusConfig = {
  online: { color: "bg-success", label: "Online", variant: "default" as const },
  offline: { color: "bg-danger", label: "Offline", variant: "destructive" as const },
  maintenance: { color: "bg-warning", label: "Maintenance", variant: "secondary" as const },
};

const ScreenStatusTable = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Screen Status Overview</h3>
            <p className="text-sm text-muted-foreground">Real-time monitoring of all BMI kiosks</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Circle className="w-2 h-2 fill-success text-success" />
              2 Online
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Circle className="w-2 h-2 fill-danger text-danger" />
              1 Offline
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/screens")}
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {screens.map((screen) => (
            <div
              key={screen.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{screen.id}</p>
                  <Badge variant={statusConfig[screen.status as keyof typeof statusConfig].variant}>
                    {statusConfig[screen.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{screen.location}</p>
              </div>

              <div className="hidden md:flex gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Last Sync</p>
                  <p className="font-medium text-foreground">{screen.lastSync}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Today</p>
                  <p className="font-medium text-foreground">{screen.todayData}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium text-foreground">{screen.totalData}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ScreenStatusTable;
