import { useState, useEffect } from "react";
import { Users, Calendar, TrendingUp, Monitor, Eye, Loader2, Activity } from "lucide-react";
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
    usersChecked: 0,
    dailyUsers: 0,
    activeScreens: 0,
    uniqueUsers: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bmiStats, screenData] = await Promise.all([
        api.getBMIStats().catch(() => null),
        api.getAllPlayers().catch(() => ({ ok: false, players: [] })),
      ]);

      if (bmiStats && bmiStats.ok) {
        setStats({
          totalScreens: bmiStats.totalScreens || 0,
          usersChecked: bmiStats.totalRecords || 0,
          dailyUsers: bmiStats.dailyUsers || 0,
          activeScreens: bmiStats.activeScreens || 0,
          uniqueUsers: bmiStats.totalUniqueUsers || 0,
        });
      }

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

  if (loading && !showEmptyState) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 bg-card rounded-lg border border-border">
                <div className="h-4 w-24 bg-muted animate-pulse rounded mb-4" />
                <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-6 bg-card rounded-lg border border-border">
                <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
                <div className="h-64 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!hasData ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Screens"
              value={stats.totalScreens}
              icon={Monitor}
              trend={`${stats.activeScreens} active now`}
              trendUp={true}
            />
            <StatCard
              title="Today's Checks"
              value={stats.dailyUsers}
              icon={Activity}
              trend="Unique users today"
              trendUp={true}
            />
            <StatCard
              title="Total BMI Checks"
              value={stats.usersChecked}
              icon={Users}
              trend="Lifetime records"
              trendUp={true}
            />
            <StatCard
              title="Unique Users"
              value={stats.uniqueUsers}
              icon={Users}
              trend="Lifetime individuals"
              trendUp={true}
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
