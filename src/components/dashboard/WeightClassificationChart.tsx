import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

const colorMap: Record<string, string> = {
  "Normal": "hsl(var(--success))",
  "Overweight": "hsl(var(--warning))",
  "Obese": "hsl(var(--danger))",
  "Underweight": "hsl(var(--info))",
};

const WeightClassificationChart = () => {
  const [data, setData] = useState<Array<{ name: string; value: number; color: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassificationData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchClassificationData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchClassificationData = async () => {
    try {
      setLoading(true);
      const response = await api.getWeightClassification() as { data: Array<{ name: string; value: number; count: number }> };
      
      if (response?.data) {
        const formattedData = response.data.map(item => ({
          ...item,
          color: colorMap[item.name] || "hsl(var(--muted))",
        }));
        setData(formattedData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weight classification:', error);
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
        <div>
          <h3 className="text-lg font-semibold text-foreground">Weight Classification</h3>
          <p className="text-sm text-muted-foreground">Distribution of BMI categories</p>
        </div>
        
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
              {data.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default WeightClassificationChart;
