import { useRef, useState } from "react";
import { Upload, X, Music, File } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { uploadFileSchema } from "@shared/schema";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onRemoveFile: () => void;
}

export function FileUpload({ onFileSelect, selectedFile, onRemoveFile }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      uploadFileSchema.parse({ file });
      onFileSelect(file);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Erreur de fichier",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    try {
      uploadFileSchema.parse({ file });
      onFileSelect(file);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Erreur de fichier",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".mp3,.wav,.flac"
      />
      
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors cursor-pointer ${
            isDragOver 
              ? 'border-spotify-green bg-dark-surface-2/50' 
              : 'border-dark-surface-3 hover:border-spotify-green'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-text-secondary mb-4" />
          <p className="text-text-primary mb-2">Glissez-déposez vos fichiers audio ici</p>
          <p className="text-text-secondary text-sm mb-4">ou</p>
          <Button 
            variant="default" 
            className="bg-white text-black hover:bg-white/90"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Parcourir les fichiers
          </Button>
          <p className="text-text-secondary text-xs mt-4">Formats acceptés: MP3, WAV, FLAC (max 50MB)</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between bg-dark-surface-2 p-3 rounded-md">
            <div className="flex items-center">
              <Music className="text-spotify-green mr-3 h-5 w-5" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-text-secondary">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-text-secondary hover:text-white" 
              onClick={onRemoveFile}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
