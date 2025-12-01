import { useState, useEffect } from "react";
import { Users, Calendar, TrendingUp, MonitorDot, Eye, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/dashboard/EmptyState";
import WeightClassificationChart from "@/components/dashboard/WeightClassificationChart";
import UserActivityChart from "@/components/dashboard/UserActivityChart";
import ScreenStatusTable from "@/components/dashboard/ScreenStatusTable";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const Dashboard = () => {
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScreens: 0,
    totalUsersChecked: 0,
    dailyUsers: 0,
    activeScreens: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bmiStats, screenData] = await Promise.all([
        api.getBMIStats().catch(() => null),
        api.getAllPlayers().catch(() => ({ ok: false, players: [] })),
      ]);

      if (bmiStats) {
        setStats({
          totalScreens: bmiStats.totalScreens || 0,
          totalUsersChecked: bmiStats.totalUsers || 0,
          dailyUsers: bmiStats.dailyUsers || 0,
          activeScreens: bmiStats.activeScreens || 0,
        });
      }

      // Calculate growth rate (placeholder for now)
      const growthRate = stats.dailyUsers > 0 ? 
        ((stats.dailyUsers - (stats.dailyUsers * 0.92)) / (stats.dailyUsers * 0.92) * 100).toFixed(1) : 0;

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const hasData = !showEmptyState && !loading;

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (loading && !showEmptyState) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Empty State Toggle */}
      {/* <div className="flex items-center justify-end gap-2 mb-4 p-3 bg-muted/30 rounded-lg border border-border">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <Label htmlFor="dashboard-empty-state" className="text-sm text-muted-foreground cursor-pointer">
          Show Empty State (Demo)
        </Label>
        <Switch
          id="dashboard-empty-state"
          checked={showEmptyState}
          onCheckedChange={setShowEmptyState}
        />
      </div> */}

      {!hasData ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Screens"
                value={formatNumber(stats.totalScreens)}
                icon={MonitorDot}
                variant="default"
                trend={{ value: stats.activeScreens > 0 ? ((stats.activeScreens / stats.totalScreens) * 100).toFixed(1) : 0, isPositive: true }}
              />
              <StatCard
                title="Total Users Checked"
                value={formatNumber(stats.totalUsersChecked)}
                icon={Users}
                variant="success"
                trend={{ value: 12.5, isPositive: true }}
              />
              <StatCard
                title="Daily Users"
                value={formatNumber(stats.dailyUsers)}
                icon={Calendar}
                variant="info"
                trend={{ value: 8.3, isPositive: true }}
              />
              <StatCard
                title="Active Screens"
                value={`${stats.activeScreens}/${stats.totalScreens}`}
                icon={TrendingUp}
                variant="warning"
                trend={{ value: stats.totalScreens > 0 ? ((stats.activeScreens / stats.totalScreens) * 100).toFixed(1) : 0, isPositive: true }}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <UserActivityChart />
              </div>
              <div>
                <WeightClassificationChart />
              </div>
            </div>

            {/* Screen Status Table */}
            <ScreenStatusTable />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
