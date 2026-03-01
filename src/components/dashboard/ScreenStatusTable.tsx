import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Circle, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

interface Screen {
  screenId: string;
  location?: string;
  status: "online" | "offline" | "maintenance";
  lastSync: string;
  todayData: number;
  totalData: number;
}

const statusConfig = {
  online: { color: "bg-success", label: "Online", variant: "default" as const },
  offline: { color: "bg-danger", label: "Offline", variant: "destructive" as const },
  maintenance: { color: "bg-warning", label: "Maintenance", variant: "secondary" as const },
};

const ScreenStatusTable = () => {
  const navigate = useNavigate();
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScreens();
    // Only fetch on mount - no automatic refresh
  }, []);

  const fetchScreens = async () => {
    try {
      setLoading(true);
      const response = await api.getAllPlayers() as { ok: boolean; players: any[] };

      if (response.ok && response.players) {
        const screensData: Screen[] = response.players.map((player) => {
          const lastSeen = new Date(player.lastSeen);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

          let status: "online" | "offline" | "maintenance" = "offline";
          if (player.isActive && lastSeen >= fiveMinutesAgo) {
            status = "online";
          } else if (!player.isActive) {
            status = "maintenance";
          } else if (lastSeen >= fortyEightHoursAgo) {
            status = "maintenance";
          } else {
            status = "offline";
          }

          const timeDiff = Math.max(0, Date.now() - lastSeen.getTime());
          const minutesAgo = Math.floor(timeDiff / (1000 * 60));
          const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
          const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

          let lastSync = "";
          if (minutesAgo < 60) {
            lastSync = `${minutesAgo} ${minutesAgo === 1 ? 'min' : 'mins'} ago`;
          } else if (hoursAgo < 24) {
            lastSync = `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
          } else {
            lastSync = `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
          }

          return {
            screenId: player.screenId,
            location: player.location || player.deviceName || "Unknown Location",
            status,
            lastSync,
            todayData: player.todayData || 0,
            totalData: player.totalData || 0,
          };
        });

        setScreens(screensData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching screens:', error);
      setLoading(false);
    }
  };

  const onlineCount = screens.filter(s => s.status === "online").length;
  const offlineCount = screens.filter(s => s.status === "offline").length;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Screen Status Overview</h3>
            <p className="text-sm text-muted-foreground">Real-time monitoring of all BMI kiosks</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 order-2 sm:order-1">
              <Badge variant="outline" className="gap-1 px-1.5 py-0">
                <Circle className="w-1.5 h-1.5 fill-success text-success" />
                <span className="text-[10px] sm:text-xs">{onlineCount} Online</span>
              </Badge>
              <Badge variant="outline" className="gap-1 px-1.5 py-0">
                <Circle className="w-1.5 h-1.5 fill-danger text-danger" />
                <span className="text-[10px] sm:text-xs">{offlineCount} Offline</span>
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs order-1 sm:order-2 ml-auto sm:ml-0"
              onClick={() => navigate("/screens")}
            >
              <span className="hidden xs:inline">View All</span>
              <ArrowRight className="w-3 h-3 xs:ml-2" />
            </Button>
          </div>
        </div>

        {screens.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No screens registered yet
          </div>
        ) : (
          <div className="space-y-3">
            {screens.map((screen) => (
              <div
                key={screen.screenId}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{screen.screenId}</p>
                    <Badge variant={statusConfig[screen.status].variant}>
                      {statusConfig[screen.status].label}
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
        )}
      </div>
    </Card>
  );
};

export default ScreenStatusTable;
