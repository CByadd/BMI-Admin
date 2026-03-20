import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Folder, FolderOpen, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MoveMediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaIds: string[];
  mediaName?: string;
  onSuccess: () => void;
}

export const MoveMediaModal = ({ 
  open, 
  onOpenChange, 
  mediaIds, 
  mediaName, 
  onSuccess 
}: MoveMediaModalProps) => {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadFolders();
    }
  }, [open]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const response = await api.getFolders() as { ok: boolean; folders: any[] };
      if (response.ok) {
        setFolders(response.folders);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load folders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async () => {
    try {
      setMoving(true);
      if (mediaIds.length === 1) {
        await api.moveMedia(mediaIds[0], selectedFolderId);
      } else {
        await api.bulkMoveMedia(mediaIds, selectedFolderId);
      }

      toast({
        title: "Success",
        description: `Successfully moved ${mediaIds.length} item(s)`,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move media",
        variant: "destructive",
      });
    } finally {
      setMoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move {mediaIds.length > 1 ? `${mediaIds.length} Assets` : "Asset"}</DialogTitle>
          <DialogDescription>
            {mediaIds.length > 1 
              ? `Move ${mediaIds.length} selected items to a different folder.`
              : `Move "${mediaName}" to a different folder.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-[300px] border rounded-md p-2">
              <div className="space-y-1">
                <Button
                  variant={selectedFolderId === null ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedFolderId(null)}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Root Folder
                </Button>
                
                {folders.map((folder) => (
                  <Button
                    key={folder.id}
                    variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
                    className="w-full justify-start pl-6"
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    {folder.name}
                  </Button>
                ))}

                {folders.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No folders available.
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={moving}
          >
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={moving || loading}>
            {moving ? "Moving..." : "Move Here"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
