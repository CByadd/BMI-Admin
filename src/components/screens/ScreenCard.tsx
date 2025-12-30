import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Monitor, MapPin, Clock, Eye, Edit, Trash2, Settings, ListVideo } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import EditScreenModal from "./EditScreenModal";
import AssignPlaylistModal from "./AssignPlaylistModal";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

interface ScreenCardProps {
  screen: {
    id: string;
    name: string;
    model: string;
    status: "online" | "offline" | "maintenance";
    location?: string;
    lastSync: string;
    todayUsers?: number;
    totalUsers?: number;
    flowType?: string | null;
  };
  onEdit?: (updatedScreen: any) => void;
  onDelete?: (screenId: string) => void;
}

const statusConfig = {
  online: { 
    color: "bg-success/10 text-success border-success/20", 
    label: "Online",
    dotColor: "bg-success" 
  },
  offline: { 
    color: "bg-danger/10 text-danger border-danger/20", 
    label: "Offline",
    dotColor: "bg-danger" 
  },
  maintenance: { 
    color: "bg-warning/10 text-warning border-warning/20", 
    label: "Maintenance",
    dotColor: "bg-warning" 
  },
};

const ScreenCard = ({ screen, onEdit, onDelete }: ScreenCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshScreens } = useData();
  const config = statusConfig[screen.status];
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignPlaylistOpen, setIsAssignPlaylistOpen] = useState(false);

  const handlePlaylistAssigned = async () => {
    // Refresh screens to show updated playlist assignment
    await refreshScreens();
  };

  const handleEdit = (updatedScreen: any) => {
    onEdit?.(updatedScreen);
    toast({
      title: "Screen Updated",
      description: "Screen information has been updated successfully.",
    });
  };

  const handleDelete = () => {
    onDelete?.(screen.id);
    setIsDeleteOpen(false);
    toast({
      title: "Screen Deleted",
      description: "Screen has been removed successfully.",
      variant: "destructive",
    });
  };

  return (
    <Card className="p-6 hover:shadow-md transition-all border-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Monitor className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{screen.name}</h3>
              <p className="text-sm text-muted-foreground">{screen.id}</p>
            </div>
          </div>
          <Badge className={config.color}>
            <div className={`w-2 h-2 rounded-full ${config.dotColor} mr-2`} />
            {config.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Monitor className="w-4 h-4" />
            <span>{screen.model}</span>
          </div>
          {screen.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{screen.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Last sync: {screen.lastSync}</span>
          </div>
        </div>

        {/* Flow Type Display */}
        <div className="space-y-2 pt-2 border-t border-border">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Settings className="w-3 h-3" />
            Flow Type
          </Label>
          <div className="text-sm font-medium text-foreground">
            {screen.flowType || "Normal"}
          </div>
        </div>

        {/* Stats */}
        {screen.todayUsers !== undefined && (
          <div className="flex gap-4 pt-4 border-t border-border">
            <div className="flex-1">
              <p className="text-2xl font-bold text-foreground">{screen.todayUsers}</p>
              <p className="text-xs text-muted-foreground">Today's Users</p>
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-foreground">{screen.totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            variant="outline"
            onClick={() => setIsAssignPlaylistOpen(true)}
          >
            <ListVideo className="w-4 h-4 mr-2" />
            Assign Playlist
          </Button>
          <Button 
            className="flex-1" 
            variant="outline"
            onClick={() => navigate(`/screens/${screen.id}`)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <EditScreenModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        screen={screen}
        onSave={handleEdit}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Screen?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{screen.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-danger hover:bg-danger/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AssignPlaylistModal
        open={isAssignPlaylistOpen}
        onOpenChange={setIsAssignPlaylistOpen}
        screenId={screen.id}
        onAssign={handlePlaylistAssigned}
      />
    </Card>
  );
};

export default ScreenCard;
