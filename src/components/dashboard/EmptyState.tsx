import { Button } from "@/components/ui/button";
import { MonitorDot, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[600px] flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-lg">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative bg-gradient-to-br from-accent to-accent/50 p-8 rounded-3xl border border-border">
            <MonitorDot className="w-20 h-20 text-primary mx-auto mb-4" />
            <TrendingUp className="w-12 h-12 text-primary/60 mx-auto" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground">No Screens Connected Yet</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Start by connecting a BMI kiosk screen to begin tracking user activity and analytics in real-time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            onClick={() => navigate("/screens")}
          >
            <MonitorDot className="w-5 h-5 mr-2" />
            Connect a Screen
          </Button>
          <Button 
            size="lg" 
            variant="outline"
          >
            View Documentation
          </Button>
        </div>

        <div className="pt-8 grid grid-cols-3 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-muted-foreground">0</div>
            <div className="text-xs text-muted-foreground">Screens</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-muted-foreground">0</div>
            <div className="text-xs text-muted-foreground">Users</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-muted-foreground">0</div>
            <div className="text-xs text-muted-foreground">Analytics</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
