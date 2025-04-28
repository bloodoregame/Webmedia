import { Link, useLocation } from "wouter";
import { Home, Search, Library, Plus, Music } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Playlist } from "@shared/schema";
import { useEffect } from "react";

interface SidebarProps {
  onUploadClick: () => void;
}

export default function Sidebar({ onUploadClick }: SidebarProps) {
  const [location] = useLocation();
  
  // Fetch playlists
  const { data: playlists } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  // Trigger upload modal from global click handler
  const handleUploadClick = () => {
    const uploadModalTrigger = document.getElementById('openUploadModal');
    if (uploadModalTrigger) {
      uploadModalTrigger.click();
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-black p-6 space-y-8">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Music className="text-spotify-green h-8 w-8" />
        <h1 className="text-2xl font-bold">MusiStream</h1>
      </div>
      
      {/* Main Navigation */}
      <nav className="space-y-2">
        <div>
          <Link href="/">
            <div className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${
              location === "/" 
                ? "text-white bg-dark-surface-2" 
                : "text-text-secondary hover:text-white transition-colors"
            }`}>
              <Home className="mr-4 h-5 w-5" />
              <span>Accueil</span>
            </div>
          </Link>
        </div>
        <div>
          <Link href="/search">
            <div className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${
              location === "/search" 
                ? "text-white bg-dark-surface-2" 
                : "text-text-secondary hover:text-white transition-colors"
            }`}>
              <Search className="mr-4 h-5 w-5" />
              <span>Rechercher</span>
            </div>
          </Link>
        </div>
        <div>
          <Link href="/library">
            <div className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${
              location === "/library" 
                ? "text-white bg-dark-surface-2" 
                : "text-text-secondary hover:text-white transition-colors"
            }`}>
              <Library className="mr-4 h-5 w-5" />
              <span>Bibliothèque</span>
            </div>
          </Link>
        </div>
      </nav>
      
      {/* Library Section */}
      <div className="bg-dark-surface rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-text-secondary">
            <Library className="mr-2 h-4 w-4" />
            <span className="font-medium">Ma bibliothèque</span>
          </div>
          <button 
            className="text-text-secondary hover:text-white transition-colors"
            onClick={() => {/* Add playlist functionality */}}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        {/* Library Items */}
        <div className="space-y-2">
          {playlists?.map((playlist) => (
            <div 
              key={playlist.id}
              className="flex items-center px-2 py-2 rounded-md hover:bg-dark-surface-2 transition cursor-pointer"
            >
              <div className={`w-10 h-10 flex-shrink-0 rounded flex items-center justify-center bg-gradient-to-br ${
                playlist.name === "Favoris" 
                  ? "from-red-600 to-orange-400" 
                  : "from-purple-700 to-blue-500"
              }`}>
                <Music className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">{playlist.name}</div>
                <div className="text-xs text-text-secondary">Playlist</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Upload Button */}
      <button 
        className="flex items-center justify-center w-full py-3 bg-spotify-green hover:bg-spotify-green-bright transition-colors rounded-full font-semibold text-black"
        onClick={handleUploadClick}
      >
        <Plus className="mr-2 h-4 w-4" />
        Télécharger de la musique
      </button>
    </aside>
  );
}
