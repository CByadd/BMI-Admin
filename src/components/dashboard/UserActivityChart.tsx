import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import api from "@/lib/api";

const UserActivityChart = () => {
  const [data, setData] = useState<Array<{ name: string; users: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [avgPerDay, setAvgPerDay] = useState(0);

  useEffect(() => {
    fetchActivityData();
    // Only fetch on mount - no automatic refresh
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const response = await api.getUserActivity() as { data: Array<{ name: string; users: number }> };
      
      if (response?.data) {
        setData(response.data);
        
        // Calculate totals
        const total = response.data.reduce((sum, item) => sum + item.users, 0);
        setTotalUsers(total);
        setAvgPerDay(response.data.length > 0 ? Math.round((total / response.data.length) * 10) / 10 : 0);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[300px]">
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
            <h3 className="text-lg font-semibold text-foreground">User Activity Trends</h3>
            <p className="text-sm text-muted-foreground">Daily measurements over time</p>
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Last 7 Days
          </Button>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.length > 0 ? data : [{ name: "No Data", users: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
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
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">+12.5%</p>
            <p className="text-xs text-muted-foreground">Growth Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{avgPerDay}</p>
            <p className="text-xs text-muted-foreground">Avg per Day</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserActivityChart;
