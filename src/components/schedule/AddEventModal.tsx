import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSave: (event: any) => void;
}

const mockPlaylists = [
  { id: "1", name: "Morning Routine Ads" },
  { id: "2", name: "Afternoon Campaign" },
  { id: "3", name: "Evening Wellness" },
];

const mockMedia = [
  { id: "1", name: "Health Tips Video.mp4" },
  { id: "2", name: "Nutrition Guide.jpg" },
  { id: "3", name: "Wellness Banner.png" },
];

export const AddEventModal = ({ open, onOpenChange, selectedDate, onSave }: AddEventModalProps) => {
  const [eventType, setEventType] = useState<"schedule" | "turnOff">("schedule");
  const [contentType, setContentType] = useState<"playlist" | "media">("playlist");
  const [selectedContent, setSelectedContent] = useState("");
  const [startDate, setStartDate] = useState<Date>(selectedDate || new Date());
  const [endDate, setEndDate] = useState<Date>(selectedDate || new Date());
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:00");
  const [repeatOption, setRepeatOption] = useState("does-not-repeat");
  const [customRepeatNumber, setCustomRepeatNumber] = useState("1");
  const [customRepeatUnit, setCustomRepeatUnit] = useState("day");
  const [repeatUntil, setRepeatUntil] = useState("forever");

  const handleSave = () => {
    const event = {
      id: Date.now().toString(),
      type: eventType,
      contentType,
      contentId: selectedContent,
      startDate,
      endDate,
      startTime,
      endTime,
      repeat: repeatOption,
    };
    onSave(event);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* SETTINGS Section */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">Settings</h3>
            
            {/* Event Type */}
            <div className="space-y-3">
              <Label>Event Type</Label>
              <RadioGroup value={eventType} onValueChange={(v) => setEventType(v as "schedule" | "turnOff")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="schedule" id="schedule" />
                  <Label htmlFor="schedule" className="cursor-pointer">Schedule Content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="turnOff" id="turnOff" />
                  <Label htmlFor="turnOff" className="cursor-pointer">Turn screen Off</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Content Selection */}
            {eventType === "schedule" && (
              <div className="space-y-3">
                <Label>Content</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={contentType} onValueChange={(v) => setContentType(v as "playlist" | "media")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="playlist">Playlist</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedContent} onValueChange={setSelectedContent}>
                    <SelectTrigger>
                      <SelectValue placeholder="No Content Assigned" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentType === "playlist"
                        ? mockPlaylists.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))
                        : mockMedia.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Event Starts */}
            <div className="space-y-3">
              <Label>Event Starts</Label>
              <div className="grid grid-cols-2 gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, "EEE, dd MMM, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={(date) => date && setStartDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>

                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Event Ends */}
            <div className="space-y-3">
              <Label>Event Ends</Label>
              <div className="grid grid-cols-2 gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, "EEE, dd MMM, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={(date) => date && setEndDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>

                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* REPEAT OPTIONS Section */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">Repeat Options</h3>
            
            <div className="space-y-3">
              <Label>Repeat</Label>
              <Select value={repeatOption} onValueChange={setRepeatOption}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="does-not-repeat">Does not repeat</SelectItem>
                  <SelectItem value="daily-mon-sun">Daily (Mon-Sun)</SelectItem>
                  <SelectItem value="weekday">Every weekday (Mon-Fri)</SelectItem>
                  <SelectItem value="weekly-monday">Weekly (every Monday)</SelectItem>
                  <SelectItem value="monthly-1st">Monthly (on the 1st day)</SelectItem>
                  <SelectItem value="annually-dec-1">Annually (on December 1)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Repeat Options */}
            {repeatOption === "custom" && (
              <>
                <div className="space-y-3">
                  <Label>Repeat Every</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      min="1"
                      value={customRepeatNumber}
                      onChange={(e) => setCustomRepeatNumber(e.target.value)}
                    />
                    <Select value={customRepeatUnit} onValueChange={setCustomRepeatUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Repeat Until</Label>
                  <Select value={repeatUntil} onValueChange={setRepeatUntil}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forever">Forever</SelectItem>
                      <SelectItem value="custom-date">Custom Date and Time</SelectItem>
                      <SelectItem value="custom-occurrences">Custom Occurrences</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <p className="text-sm text-muted-foreground">
              The schedule runs on the screens' local time zone.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
