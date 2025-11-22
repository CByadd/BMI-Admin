import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Normal", value: 45, color: "hsl(var(--success))" },
  { name: "Overweight", value: 30, color: "hsl(var(--warning))" },
  { name: "Obese", value: 15, color: "hsl(var(--danger))" },
  { name: "Underweight", value: 10, color: "hsl(var(--info))" },
];

const WeightClassificationChart = () => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Weight Classification</h3>
          <p className="text-sm text-muted-foreground">Distribution of BMI categories</p>
        </div>
        
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
      </div>
    </Card>
  );
};

export default WeightClassificationChart;
