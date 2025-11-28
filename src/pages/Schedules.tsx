import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Eye, Loader2 } from "lucide-react";
import { ScheduleEmptyState } from "@/components/schedule/ScheduleEmptyState";
import { ScheduleCard } from "@/components/schedule/ScheduleCard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";

const Schedules = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmptyState, setShowEmptyState] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.getAllSchedules() as { ok: boolean; schedules: any[] };
      if (response.ok && response.schedules) {
        setSchedules(response.schedules);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate("/schedules/new");
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSchedule(id);
      toast.success("Schedule deleted successfully");
      fetchSchedules();
    } catch (error) {
      toast.error("Failed to delete schedule");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const original = schedules.find((s) => s.id === id);
      if (original) {
        const scheduleData = await api.getSchedule(id) as { ok: boolean; schedule: any };
        if (scheduleData.ok && scheduleData.schedule) {
          const duplicate = {
            name: `${original.name} (Copy)`,
            description: scheduleData.schedule.description,
            events: scheduleData.schedule.events,
          };
          await api.createSchedule(duplicate);
          toast.success("Schedule duplicated successfully");
          fetchSchedules();
        }
      }
    } catch (error) {
      toast.error("Failed to duplicate schedule");
    }
  };

  const filteredSchedules = schedules.filter(
    (schedule) =>
      schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasSchedules = !showEmptyState && !loading && schedules.length > 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Empty State Toggle */}
      <div className="flex items-center justify-end gap-2 mb-4 p-3 bg-muted/30 rounded-lg border border-border">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <Label htmlFor="schedule-empty-state" className="text-sm text-muted-foreground cursor-pointer">
          Show Empty State (Demo)
        </Label>
        <Switch
          id="schedule-empty-state"
          checked={showEmptyState}
          onCheckedChange={setShowEmptyState}
        />
      </div>

      {!hasSchedules ? (
        <ScheduleEmptyState onCreate={handleCreate} />
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search schedules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button onClick={handleCreate} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add New Schedule
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Total Schedules: {schedules.length}</span>
            <span>Active: {schedules.filter((s) => s.status === "active").length}</span>
            <span>Inactive: {schedules.filter((s) => s.status === "inactive").length}</span>
          </div>

          {/* Schedule Grid */}
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No schedules found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Schedules;
