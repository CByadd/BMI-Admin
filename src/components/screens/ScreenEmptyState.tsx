import { Button } from "@/components/ui/button";
import { MonitorOff, Plus } from "lucide-react";

interface ScreenEmptyStateProps {
  onConnect: () => void;
}

const ScreenEmptyState = ({ onConnect }: ScreenEmptyStateProps) => {
  return (
    <div className="min-h-[600px] flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-lg">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-muted/50 blur-3xl rounded-full" />
          <div className="relative bg-gradient-to-br from-accent to-accent/50 p-8 rounded-3xl border border-border">
            <MonitorOff className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
            <div className="w-16 h-1 bg-border rounded-full mx-auto" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground">No Screens Connected Yet</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Connect your first BMI kiosk to start tracking user data and analytics in real-time.
          </p>
        </div>

        <div className="pt-4">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            onClick={onConnect}
          >
            <Plus className="w-5 h-5 mr-2" />
            Connect New Screen
          </Button>
        </div>

        <div className="pt-8 space-y-4">
          <p className="text-sm font-medium text-muted-foreground">What you can do once connected:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-primary font-bold">1</span>
              </div>
              <p className="text-sm font-medium text-foreground">Monitor Status</p>
              <p className="text-xs text-muted-foreground mt-1">Real-time device health tracking</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center mb-2">
                <span className="text-success font-bold">2</span>
              </div>
              <p className="text-sm font-medium text-foreground">View User Logs</p>
              <p className="text-xs text-muted-foreground mt-1">Complete measurement history</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center mb-2">
                <span className="text-info font-bold">3</span>
              </div>
              <p className="text-sm font-medium text-foreground">Manage Remotely</p>
              <p className="text-xs text-muted-foreground mt-1">Configure and update settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenEmptyState;
