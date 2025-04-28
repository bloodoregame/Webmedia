import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { insertTrackSchema } from "@shared/schema";
import { FileUpload } from "@/components/ui/file-upload";
import { X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { API_BASE, UPLOAD_ENDPOINT, TRACKS_ENDPOINT } from "@/lib/config";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error("No file selected");
      }
      
      try {
        // Validate data
        insertTrackSchema.parse({
          title: title || "Untitled",
          artist: artist || "Unknown Artist",
          album: album || null,
          duration: 0, // This will be calculated on the server
          filename: file.name,
          coverImage: null
        });
        
        // Create form data
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title || "Untitled");
        formData.append("artist", artist || "Unknown Artist");
        if (album) formData.append("album", album);
        
        // Send request to correct endpoint based on environment
        const response = await fetch(UPLOAD_ENDPOINT, {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Upload failed");
        }
        
        return await response.json();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unknown error occurred");
      }
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your track has been uploaded successfully!",
      });
      
      // Reset form
      resetForm();
      
      // Close modal
      onClose();
      
      // Invalidate tracks query to refresh the list
      queryClient.invalidateQueries({ queryKey: [TRACKS_ENDPOINT] });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an audio file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate();
  };
  
  const resetForm = () => {
    setFile(null);
    setTitle("");
    setArtist("");
    setAlbum("");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-dark-surface text-white border-dark-surface-3 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Ajouter de la musique</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {/* Upload Area */}
          <FileUpload
            onFileSelect={setFile}
            selectedFile={file}
            onRemoveFile={() => setFile(null)}
          />
          
          {/* Form Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="title" className="text-sm text-text-secondary block mb-2">Titre de la piste</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entrer le titre"
                className="bg-dark-surface-2 w-full p-3 rounded-md text-white placeholder-text-tertiary border-0 focus-visible:ring-spotify-green"
              />
            </div>
            
            <div>
              <Label htmlFor="artist" className="text-sm text-text-secondary block mb-2">Artiste</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Nom de l'artiste"
                className="bg-dark-surface-2 w-full p-3 rounded-md text-white placeholder-text-tertiary border-0 focus-visible:ring-spotify-green"
              />
            </div>
            
            <div>
              <Label htmlFor="album" className="text-sm text-text-secondary block mb-2">Album (optionnel)</Label>
              <Input
                id="album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Nom de l'album"
                className="bg-dark-surface-2 w-full p-3 rounded-md text-white placeholder-text-tertiary border-0 focus-visible:ring-spotify-green"
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <DialogFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              className="py-2 px-6 rounded-full bg-dark-surface-2 text-white hover:bg-dark-surface-3 border-0"
              onClick={onClose}
              disabled={uploadMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="py-2 px-6 rounded-full bg-spotify-green hover:bg-spotify-green-bright text-black font-medium"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Téléchargement...
                </>
              ) : (
                "Télécharger"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
