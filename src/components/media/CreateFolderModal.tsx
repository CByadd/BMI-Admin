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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
  onSuccess: () => void;
  editFolder?: { id: string; name: string } | null;
}

export const CreateFolderModal = ({ 
  open, 
  onOpenChange, 
  parentId, 
  onSuccess,
  editFolder 
}: CreateFolderModalProps) => {
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editFolder) {
      setFolderName(editFolder.name);
    } else {
      setFolderName("");
    }
  }, [editFolder, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    try {
      setIsLoading(true);
      if (editFolder) {
        await api.updateFolder(editFolder.id, folderName.trim(), parentId);
        toast({
          title: "Success",
          description: "Folder renamed successfully",
        });
      } else {
        await api.createFolder(folderName.trim(), parentId);
        toast({
          title: "Success",
          description: "Folder created successfully",
        });
      }
      onSuccess();
      onOpenChange(false);
      setFolderName("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save folder",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editFolder ? "Rename Folder" : "New Folder"}</DialogTitle>
          <DialogDescription>
            {editFolder ? "Enter a new name for the folder." : "Enter a name for your new media folder."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-name" className="text-right">
                Name
              </Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="col-span-3"
                autoFocus
                placeholder="Folder name..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : editFolder ? "Rename" : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
