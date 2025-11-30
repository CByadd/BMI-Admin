import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileVideo, FileImage, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface UploadMediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: () => void;
}

export const UploadMediaModal = ({ open, onOpenChange, onUploadSuccess }: UploadMediaModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/') || file.type.startsWith('video/')
      );
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateFiles = () => {
    for (const file of files) {
      if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 5MB limit for images.`,
          variant: "destructive",
        });
        return false;
      }
      if (file.type.startsWith('video/') && file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 100MB limit for videos.`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!validateFiles()) return;

    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      if (name) {
        formData.append('name', name);
      }
      
      if (tags) {
        formData.append('tags', tags);
      }

      // Upload to server
      const response = await api.uploadMedia(formData);
      
      if (response.ok) {
        toast({
          title: "Upload successful",
          description: response.message || `Successfully uploaded ${files.length} file(s)!`,
        });

        // Reset form
        setFiles([]);
        setName("");
        setTags("");
        onUploadSuccess();
        onOpenChange(false);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error?.message || "Failed to upload media. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('video/')) {
      return <FileVideo className="w-8 h-8 text-primary" />;
    }
    return <FileImage className="w-8 h-8 text-primary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>Upload File(s)</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supported: JPG, PNG, MP4, MOV (Images up to 5MB, Videos up to 100MB)
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Browse Files
              </Button>
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({files.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {file.type.split('/')[0]}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              placeholder="Enter a name for easy identification"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Tags Field */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              placeholder="e.g., Health, Ad Campaign (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload & Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
