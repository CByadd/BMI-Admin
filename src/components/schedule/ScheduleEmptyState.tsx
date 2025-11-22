import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ScheduleEmptyStateProps {
  onCreate: () => void;
}

export const ScheduleEmptyState = ({ onCreate }: ScheduleEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Calendar className="w-12 h-12 text-primary" />
      </div>
      
      <h2 className="text-2xl font-semibold mb-2 text-center">No Schedules Created Yet</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Create your first schedule and start managing when content appears on your screens.
      </p>
      
      <Button onClick={onCreate} size="lg">
        <Calendar className="mr-2 h-5 w-5" />
        Add New Schedule
      </Button>
    </div>
  );
};
