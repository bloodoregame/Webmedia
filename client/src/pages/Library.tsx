import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Track, Playlist } from "@shared/schema";
import Sidebar from "@/components/layout/Sidebar";
import MusicCard from "@/components/music/MusicCard";
import { Library as LibraryIcon, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import TrackList from "@/components/music/TrackList";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

export default function Library() {
  const [activePlaylistId, setActivePlaylistId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all playlists
  const { data: playlists, isLoading: playlistsLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });
  
  // Fetch active playlist with tracks
  const { data: activePlaylist, isLoading: playlistTracksLoading } = useQuery<{
    id: number;
    name: string;
    createdAt: string;
    tracks: Track[];
  }>({
    queryKey: [`/api/playlists/${activePlaylistId}`],
    enabled: activePlaylistId !== null,
  });
  
  // Fetch all tracks (for "All Music" tab)
  const { data: allTracks, isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", searchQuery],
    queryFn: async ({ queryKey }) => {
      const [_, query] = queryKey;
      const url = query 
        ? `/api/tracks?search=${encodeURIComponent(query)}` 
        : "/api/tracks";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tracks");
      return res.json();
    }
  });
  
  const handleUploadClick = () => {
    const uploadModalTrigger = document.getElementById('openUploadModal');
    if (uploadModalTrigger) {
      uploadModalTrigger.click();
    }
  };
  
  const isLoading = playlistsLoading || tracksLoading || (activePlaylistId && playlistTracksLoading);
  
  const displayedTracks = activePlaylist ? activePlaylist.tracks : allTracks || [];
  const playlistTitle = activePlaylist ? activePlaylist.name : "Toute votre musique";
  
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar (Desktop only) */}
      <Sidebar onUploadClick={handleUploadClick} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="bg-gradient-to-b from-dark-surface-3 to-dark-base px-4 md:px-8 pt-4 md:pt-6 pb-8">
          
          {/* Mobile Header (mobile only) */}
          <div className="flex justify-between items-center mb-6 md:hidden">
            <div className="flex items-center">
              <span className="text-spotify-green text-2xl">♪</span>
              <h1 className="text-xl font-bold ml-2">MusiStream</h1>
            </div>
            <button 
              className="p-2 text-white rounded-full bg-dark-surface-2"
              onClick={handleUploadClick}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          
          {/* Library Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <LibraryIcon className="h-8 w-8 text-white mr-3" />
              <h1 className="text-3xl font-bold">Votre Bibliothèque</h1>
            </div>
            <button
              className="bg-spotify-green hover:bg-spotify-green-bright text-black font-medium py-2 px-4 md:px-6 rounded-full hidden md:flex items-center"
              onClick={handleUploadClick}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter de la musique
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary h-5 w-5" />
            <Input
              type="text"
              placeholder="Rechercher dans votre bibliothèque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-dark-surface-2 w-full py-3 pl-12 pr-4 rounded-full text-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-spotify-green border-none"
            />
          </div>
          
          {/* Tabs for Playlists */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="bg-dark-surface-2">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-dark-surface-3"
                onClick={() => setActivePlaylistId(null)}
              >
                Toute la musique
              </TabsTrigger>
              
              {playlists?.map((playlist) => (
                <TabsTrigger 
                  key={playlist.id}
                  value={`playlist-${playlist.id}`}
                  className="data-[state=active]:bg-dark-surface-3"
                  onClick={() => setActivePlaylistId(playlist.id)}
                >
                  {playlist.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center py-10">
              <div className="w-16 h-16 rounded-full border-4 border-dark-surface-2 border-t-spotify-green animate-spin"></div>
            </div>
          )}
          
          {/* No tracks state */}
          {!isLoading && displayedTracks.length === 0 && (
            <div className="text-center py-10">
              <LibraryIcon className="h-16 w-16 mx-auto text-text-secondary mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Votre bibliothèque est vide"}
              </h2>
              <p className="text-text-secondary mb-6">
                {searchQuery ? "Essayez un autre terme de recherche" : "Ajoutez de la musique pour commencer à écouter"}
              </p>
              <button
                className="bg-spotify-green hover:bg-spotify-green-bright text-black font-medium py-2 px-6 rounded-full"
                onClick={handleUploadClick}
              >
                Télécharger de la musique
              </button>
            </div>
          )}
          
          {/* Track list */}
          {!isLoading && displayedTracks.length > 0 && (
            <TrackList tracks={displayedTracks} title={playlistTitle} />
          )}
        </div>
      </main>
    </div>
  );
}
