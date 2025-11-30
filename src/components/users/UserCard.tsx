import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, Calendar, Activity, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    mobile: string;
    createdAt: string;
    totalBMIRecords: number;
    latestBMI: {
      bmi: number;
      category: string;
      weight: number;
      height: number;
      timestamp: string;
    } | null;
  };
}

const getBMICategoryColor = (category: string) => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('underweight')) {
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  } else if (categoryLower.includes('normal')) {
    return 'bg-success/10 text-success border-success/20';
  } else if (categoryLower.includes('overweight')) {
    return 'bg-warning/10 text-warning border-warning/20';
  } else if (categoryLower.includes('obese')) {
    return 'bg-danger/10 text-danger border-danger/20';
  }
  return 'bg-muted text-muted-foreground border-border';
};

const UserCard = ({ user }: UserCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-all border-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{user.name}</h3>
              <p className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}...</p>
            </div>
          </div>
          {user.latestBMI && (
            <Badge className={getBMICategoryColor(user.latestBMI.category)}>
              {user.latestBMI.category}
            </Badge>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{user.mobile}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>

        {/* BMI Stats */}
        {user.latestBMI ? (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Latest BMI</span>
              <span className="text-lg font-bold text-foreground">
                {user.latestBMI.bmi.toFixed(1)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Weight</p>
                <p className="text-sm font-semibold text-foreground">
                  {user.latestBMI.weight.toFixed(1)} kg
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Height</p>
                <p className="text-sm font-semibold text-foreground">
                  {user.latestBMI.height.toFixed(0)} cm
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="w-3 h-3" />
              <span>Last checked {formatDate(user.latestBMI.timestamp)}</span>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center py-2">
              No BMI records yet
            </p>
          </div>
        )}

        {/* Total Records */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Records</span>
          </div>
          <Badge variant="outline" className="font-semibold">
            {user.totalBMIRecords}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;












