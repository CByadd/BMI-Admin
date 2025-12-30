import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Loader2 } from "lucide-react";
import { format, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

interface UserLog {
  id: string;
  date: string;
  userName: string;
  mobile: string;
  weight: number;
  height: number;
  bmi: number;
  category: string;
  location: string;
  waterIntake: string | null;
}

interface PeakHoursChartProps {
  userLogs: UserLog[];
  loading?: boolean;
  onDateRangeChange?: (startDate: Date | undefined, endDate: Date | undefined) => void;
}

type DateRangeOption = "today" | "week" | "month";

const PeakHoursChart = ({ userLogs, loading = false, onDateRangeChange }: PeakHoursChartProps) => {
  const [dateRange, setDateRange] = useState<DateRangeOption>("today");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Calculate date range based on selected option
  useEffect(() => {
    const now = new Date();
    let start: Date;
    let end: Date;
    
    switch (dateRange) {
      case "today":
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start = startOfWeek(now, { weekStartsOn: 1 }); // Start of week (Monday)
        start.setHours(0, 0, 0, 0);
        end = endOfWeek(now, { weekStartsOn: 1 }); // End of week (Sunday)
        end.setHours(23, 59, 59, 999);
        break;
      case "month":
        start = startOfMonth(now);
        start.setHours(0, 0, 0, 0);
        end = endOfMonth(now);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
    }
    
    setStartDate(start);
    setEndDate(end);
    
    // Trigger callback to fetch data
    if (onDateRangeChange) {
      onDateRangeChange(start, end);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // Calculate chart data based on selected period
  const chartData = useMemo(() => {
    if (!userLogs || userLogs.length === 0 || !startDate || !endDate) {
      // Return empty data structure based on period type
      if (dateRange === "today") {
        return Array.from({ length: 24 }, (_, i) => ({
          label: i.toString().padStart(2, "0") + ":00",
          count: 0,
        }));
      } else if (dateRange === "week") {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
        return days.map(day => ({
          label: format(day, "EEE"),
          count: 0,
        }));
      } else {
        const monthStart = startOfMonth(new Date());
        const monthEnd = endOfMonth(new Date());
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
        return days.map(day => ({
          label: format(day, "MMM dd"),
          count: 0,
        }));
      }
    }

    // Filter logs by date range
    const filteredLogs = userLogs.filter((log) => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    });

    if (dateRange === "today") {
      // Group by hour for today
      const hourCounts: { [key: number]: number } = {};
      for (let i = 0; i < 24; i++) {
        hourCounts[i] = 0;
      }

      filteredLogs.forEach((log) => {
        const logDate = new Date(log.date);
        const hour = logDate.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      return Object.keys(hourCounts).map((hour) => ({
        label: parseInt(hour).toString().padStart(2, "0") + ":00",
        count: hourCounts[parseInt(hour)],
      }));
    } else if (dateRange === "week") {
      // Group by day for this week
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      
      const dayCounts: { [key: string]: number } = {};
      days.forEach(day => {
        const dayKey = format(day, "yyyy-MM-dd");
        dayCounts[dayKey] = 0;
      });

      filteredLogs.forEach((log) => {
        const logDate = new Date(log.date);
        const dayKey = format(logDate, "yyyy-MM-dd");
        if (dayCounts.hasOwnProperty(dayKey)) {
          dayCounts[dayKey] = (dayCounts[dayKey] || 0) + 1;
        }
      });

      return days.map(day => ({
        label: format(day, "EEE"),
        count: dayCounts[format(day, "yyyy-MM-dd")] || 0,
      }));
    } else {
      // Group by date for this month
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      
      const dayCounts: { [key: string]: number } = {};
      days.forEach(day => {
        const dayKey = format(day, "yyyy-MM-dd");
        dayCounts[dayKey] = 0;
      });

      filteredLogs.forEach((log) => {
        const logDate = new Date(log.date);
        const dayKey = format(logDate, "yyyy-MM-dd");
        if (dayCounts.hasOwnProperty(dayKey)) {
          dayCounts[dayKey] = (dayCounts[dayKey] || 0) + 1;
        }
      });

      return days.map(day => ({
        label: format(day, "MMM dd"),
        count: dayCounts[format(day, "yyyy-MM-dd")] || 0,
      }));
    }
  }, [userLogs, startDate, endDate, dateRange]);

  const handleDateRangeChange = (value: DateRangeOption) => {
    setDateRange(value);
  };

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);
  const totalUsers = chartData.reduce((sum, d) => sum + d.count, 0);
  const peakPeriod = chartData.reduce((max, d) => (d.count > max.count ? d : max), chartData[0]);
  
  const getChartTitle = () => {
    switch (dateRange) {
      case "today":
        return "User activity by hour of day";
      case "week":
        return "User activity by day of week";
      case "month":
        return "User activity by date";
      default:
        return "User activity";
    }
  };
  
  const getStatsLabel = () => {
    switch (dateRange) {
      case "today":
        return "Peak Hour";
      case "week":
        return "Peak Day";
      case "month":
        return "Peak Date";
      default:
        return "Peak";
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Peak Hours Analysis</h3>
            <p className="text-sm text-muted-foreground">{getChartTitle()}</p>
          </div>
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: dateRange === "month" ? 80 : 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              angle={dateRange === "month" ? -90 : -45}
              textAnchor="end"
              height={dateRange === "month" ? 100 : 80}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              domain={[0, maxCount]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              formatter={(value: number) => [value, "Users"]}
            />
            <Bar
              dataKey="count"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-border gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{peakPeriod.label}</p>
            <p className="text-xs text-muted-foreground">{getStatsLabel()}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{peakPeriod.count}</p>
            <p className="text-xs text-muted-foreground">Peak Count</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PeakHoursChart;

