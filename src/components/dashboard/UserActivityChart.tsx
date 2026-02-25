import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

const RANGE_OPTIONS = [
  { label: "Last 7 Days", value: "7" },
  { label: "Last 30 Days", value: "30" },
  { label: "Last 90 Days", value: "90" },
];

const UserActivityChart = () => {
  const [data, setData] = useState<Array<{ name: string; users: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [avgPerDay, setAvgPerDay] = useState(0);
  const [days, setDays] = useState("7");

  useEffect(() => {
    fetchActivityData(Number(days));
  }, [days]);

  const fetchActivityData = async (daysCount: number) => {
    try {
      setLoading(true);
      const response = await api.getUserActivity(daysCount) as { data: Array<{ name: string; users: number }> };

      if (response?.data) {
        setData(response.data);
        const total = response.data.reduce((sum, item) => sum + item.users, 0);
        setTotalUsers(total);
        setAvgPerDay(response.data.length > 0 ? Math.round((total / response.data.length) * 10) / 10 : 0);
      }
    } catch (error) {
      console.error("Error fetching user activity:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pick a sensible X-axis tick interval so labels don't overlap
  const daysNum = Number(days);
  // 7d: show all day names | 30d: show all dates rotated | 90d: show every 6th
  const xAxisInterval = daysNum <= 7 ? 0 : daysNum <= 30 ? 0 : 6;
  const rotateLabels = daysNum > 7;
  const chartBottomMargin = rotateLabels ? 30 : 5;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">User Activity Trends</h3>
            <p className="text-sm text-muted-foreground">Daily measurements over time</p>
          </div>

          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chart */}
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={310}>
            <LineChart
              data={data.length > 0 ? data : [{ name: "No Data", users: 0 }]}
              margin={{ bottom: chartBottomMargin }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                interval={xAxisInterval}
                angle={rotateLabels ? -45 : 0}
                textAnchor={rotateLabels ? "end" : "middle"}
                tick={{ fontSize: rotateLabels ? 10 : 12 }}
                height={rotateLabels ? 50 : 30}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={Number(days) <= 7 ? { fill: "hsl(var(--primary))", r: 4 } : false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total in Period</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">+12.5%</p>
            <p className="text-xs text-muted-foreground">Growth Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{avgPerDay}</p>
            <p className="text-xs text-muted-foreground">Avg / Day</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserActivityChart;
