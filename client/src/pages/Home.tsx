import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Track } from "@shared/schema";
import Sidebar from "@/components/layout/Sidebar";
import MusicCard from "@/components/music/MusicCard";
import { Upload, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import TrackList from "@/components/music/TrackList";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all tracks
  const { data: tracks, isLoading } = useQuery<Track[]>({
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
  
  // Get recent tracks (top 5)
  const recentTracks = tracks?.slice(0, 5) || [];
  
  // Filter tracks for library section
  const libraryTracks = tracks || [];
  
  // Handle upload button click
  const handleUploadClick = () => {
    const uploadModalTrigger = document.getElementById('openUploadModal');
    if (uploadModalTrigger) {
      uploadModalTrigger.click();
    }
  };
  
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
              <Upload className="h-5 w-5" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary h-5 w-5" />
            <Input
              type="text"
              placeholder="Rechercher des titres, artistes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-dark-surface-2 w-full py-3 pl-12 pr-4 rounded-full text-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-spotify-green border-none"
            />
          </div>
          
          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center py-10">
              <div className="w-16 h-16 rounded-full border-4 border-dark-surface-2 border-t-spotify-green animate-spin"></div>
            </div>
          )}
          
          {/* No results state */}
          {!isLoading && tracks?.length === 0 && (
            <div className="text-center py-10">
              <p className="text-text-secondary text-lg mb-4">Aucun titre trouvé</p>
              <button
                className="bg-spotify-green hover:bg-spotify-green-bright text-black font-medium py-2 px-6 rounded-full"
                onClick={handleUploadClick}
              >
                Télécharger de la musique
              </button>
            </div>
          )}
          
          {/* Content when tracks are available */}
          {!isLoading && tracks && tracks.length > 0 && (
            <>
              {/* Recent Uploads */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Ajoutés récemment</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {recentTracks.map((track) => (
                    <MusicCard key={track.id} track={track} />
                  ))}
                </div>
              </section>
              
              {/* Your Library */}
              <section>
                <TrackList tracks={libraryTracks} title="Votre bibliothèque" />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
