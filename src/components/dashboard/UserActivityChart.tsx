import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const data = [
  { name: "Mon", users: 45 },
  { name: "Tue", users: 52 },
  { name: "Wed", users: 48 },
  { name: "Thu", users: 65 },
  { name: "Fri", users: 58 },
  { name: "Sat", users: 72 },
  { name: "Sun", users: 68 },
];

const UserActivityChart = () => {
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
          <LineChart data={data}>
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
            <p className="text-2xl font-bold text-foreground">408</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">+12.5%</p>
            <p className="text-xs text-muted-foreground">Growth Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">58.3</p>
            <p className="text-xs text-muted-foreground">Avg per Day</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserActivityChart;
