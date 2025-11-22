import { useState } from "react";
import { Users, Calendar, TrendingUp, MonitorDot, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/dashboard/EmptyState";
import WeightClassificationChart from "@/components/dashboard/WeightClassificationChart";
import UserActivityChart from "@/components/dashboard/UserActivityChart";
import ScreenStatusTable from "@/components/dashboard/ScreenStatusTable";

const Dashboard = () => {
  const [showEmptyState, setShowEmptyState] = useState(false);
  const hasData = !showEmptyState;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Empty State Toggle */}
      <div className="flex items-center justify-end gap-2 mb-4 p-3 bg-muted/30 rounded-lg border border-border">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <Label htmlFor="dashboard-empty-state" className="text-sm text-muted-foreground cursor-pointer">
          Show Empty State (Demo)
        </Label>
        <Switch
          id="dashboard-empty-state"
          checked={showEmptyState}
          onCheckedChange={setShowEmptyState}
        />
      </div>

      {!hasData ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Screens"
                value={4}
                icon={MonitorDot}
                variant="default"
                trend={{ value: 25, isPositive: true }}
              />
              <StatCard
                title="Total Users Checked"
                value="3,520"
                icon={Users}
                variant="success"
                trend={{ value: 12.5, isPositive: true }}
              />
              <StatCard
                title="Daily Users"
                value={408}
                icon={Calendar}
                variant="info"
                trend={{ value: 8.3, isPositive: true }}
              />
              <StatCard
                title="Growth Rate"
                value="+18.2%"
                icon={TrendingUp}
                variant="warning"
                trend={{ value: 3.1, isPositive: true }}
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
