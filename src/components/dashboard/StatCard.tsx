import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string | {
    value: number;
    isPositive: boolean;
  };
  trendUp?: boolean;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp, variant = "default" }: StatCardProps) => {
  const variantStyles = {
    default: "from-primary/10 to-primary/5 border-primary/20",
    success: "from-success/10 to-success/5 border-success/20",
    warning: "from-warning/10 to-warning/5 border-warning/20",
    danger: "from-danger/10 to-danger/5 border-danger/20",
    info: "from-info/10 to-info/5 border-info/20",
  };

  const iconStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    info: "bg-info/10 text-info",
  };

  const renderTrend = () => {
    if (!trend) return null;

    if (typeof trend === 'string') {
      return (
        <p className={cn(
          "text-[10px] sm:text-xs font-medium",
          trendUp ? "text-success" : "text-muted-foreground"
        )}>
          {trend}
        </p>
      );
    }

    return (
      <p className={cn(
        "text-[10px] sm:text-xs font-medium",
        trend.isPositive ? "text-success" : "text-danger"
      )}>
        {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% <span className="hidden xs:inline">vs last period</span>
      </p>
    );
  };

  return (
    <Card className={cn(
      "p-4 sm:p-6 bg-gradient-to-br border transition-all hover:shadow-md",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
          {renderTrend()}
        </div>
        <div className={cn(
          "p-2 sm:p-3 rounded-xl",
          iconStyles[variant]
        )}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
