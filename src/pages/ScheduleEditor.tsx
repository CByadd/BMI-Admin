import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Plus, Info, Loader2 } from "lucide-react";
import { AddEventModal } from "@/components/schedule/AddEventModal";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import api from "@/lib/api";

const ScheduleEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [scheduleName, setScheduleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [eventsOpen, setEventsOpen] = useState(true);

  useEffect(() => {
    // Check if we're creating a new schedule
    const isNewSchedule = location.pathname === "/schedules/new" || !id || id === "new";
    
    if (isNewSchedule) {
      // Creating a new schedule - no loading needed
      setLoading(false);
    } else {
      // Loading an existing schedule
      setLoading(true);
      loadSchedule();
    }
  }, [id, location.pathname]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.getSchedule(id!) as { ok: boolean; schedule: any };
      if (response.ok && response.schedule) {
        setScheduleName(response.schedule.name);
        setEvents(response.schedule.events || []);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setAddEventModalOpen(true);
  };

  const handleSaveEvent = (event: any) => {
    setEvents((prev) => [...prev, event]);
    toast.success("Event added successfully");
  };

  const handleSaveSchedule = async () => {
    if (!scheduleName.trim()) {
      toast.error("Please enter a schedule name");
      return;
    }

    try {
      setSaving(true);
      if (id && id !== "new") {
        await api.updateSchedule(id, { name: scheduleName, events });
      } else {
        const response = await api.createSchedule({ name: scheduleName, events }) as { ok: boolean; schedule: any };
        if (response.ok) {
          navigate(`/schedules/${response.schedule.id}`);
          return;
        }
      }
      toast.success("Schedule saved successfully");
      navigate("/schedules");
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.startDate), date));
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-3 sm:p-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate("/schedules")} className="flex-shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Schedule Name"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              className="flex-1 sm:max-w-xs"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/schedules")} className="flex-1 sm:flex-none" disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} className="flex-1 sm:flex-none" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Calendar Section */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto max-w-6xl">
            {/* Calendar Controls */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="icon" variant="default" onClick={() => setAddEventModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={handleToday} size="sm">
                    Today
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <h2 className="text-xl sm:text-2xl font-semibold text-center sm:text-left">
                {format(currentDate, "MMMM yyyy")}
              </h2>
            </div>

            {/* Calendar Grid */}
            <div className="bg-card rounded-lg border overflow-hidden">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 border-b bg-muted/30">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground"
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isTodayDate = isToday(day);

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "min-h-[60px] sm:min-h-[80px] md:min-h-[100px] p-1 sm:p-2 border-r border-b cursor-pointer hover:bg-muted/50 transition-colors",
                        !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                        isTodayDate && "bg-primary/5"
                      )}
                      onClick={() => handleDateClick(day)}
                    >
                      <div
                        className={cn(
                          "text-xs sm:text-sm font-medium mb-1",
                          isTodayDate && "text-primary font-bold"
                        )}
                      >
                        {format(day, "d")}
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        {dayEvents.slice(0, 2).map((event, i) => (
                          <div
                            key={i}
                            className="text-[10px] sm:text-xs bg-primary/10 text-primary px-0.5 sm:px-1 py-0.5 rounded truncate"
                          >
                            <span className="hidden sm:inline">{event.type === "schedule" ? "📅" : "🔴"} </span>
                            {event.startTime}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            +{dayEvents.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Events Sidebar */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-muted/30 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Events List</h3>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="text-sm text-muted-foreground">
              View all past and future events in this schedule. The order shows priority for display during overlaps.
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Events Style</span>
              <div className="flex gap-1">
                <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary/20" />
                <div className="w-5 h-5 rounded-full border-2 border-border" />
              </div>
            </div>

            <Collapsible open={eventsOpen} onOpenChange={setEventsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-background rounded-lg">
                <span className="font-medium">Scheduled Events</span>
                <ChevronRight className={cn("h-4 w-4 transition-transform", eventsOpen && "rotate-90")} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                {events.length === 0 ? (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium text-primary">Filler Content</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Shown on the screens when no events are scheduled
                    </p>
                  </div>
                ) : (
                  events.map((event, idx) => (
                    <div key={idx} className="p-3 bg-background border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={event.type === "schedule" ? "default" : "secondary"}>
                          {event.type === "schedule" ? "Content" : "Turn Off"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.startDate), "MMM dd")}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {event.startTime} - {event.endTime}
                      </p>
                      {event.type === "schedule" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.contentType === "playlist" ? "Playlist" : "Media"}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CollapsibleContent>
            </Collapsible>

            <Button variant="outline" className="w-full" size="sm">
              View assigned screens
            </Button>
          </div>
        </div>
      </div>

      <AddEventModal
        open={addEventModalOpen}
        onOpenChange={setAddEventModalOpen}
        selectedDate={selectedDate || undefined}
        onSave={handleSaveEvent}
      />
    </div>
  );
};

export default ScheduleEditor;
