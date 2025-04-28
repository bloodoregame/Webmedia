import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Track } from "@shared/schema";
import Sidebar from "@/components/layout/Sidebar";
import TrackList from "@/components/music/TrackList";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: searchResults, isLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", searchQuery],
    queryFn: async ({ queryKey }) => {
      const [_, query] = queryKey;
      if (!query) return [];
      
      const url = `/api/tracks?search=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch search results");
      return res.json();
    },
    enabled: searchQuery.length > 0
  });
  
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
          </div>
          
          {/* Search Header */}
          <h1 className="text-3xl font-bold mb-6 hidden md:block">Rechercher</h1>
          
          {/* Search Bar */}
          <div className="relative mb-8">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary h-5 w-5" />
            <Input
              type="text"
              placeholder="Que souhaitez-vous écouter ?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="bg-dark-surface-2 w-full py-3 pl-12 pr-4 rounded-full text-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-spotify-green border-none"
            />
          </div>
          
          {/* Empty state - no search yet */}
          {!searchQuery && (
            <div className="text-center py-10">
              <SearchIcon className="h-16 w-16 mx-auto text-text-secondary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Recherchez vos titres préférés</h2>
              <p className="text-text-secondary">Entrez un nom d'artiste, titre ou album</p>
            </div>
          )}
          
          {/* Loading state */}
          {searchQuery && isLoading && (
            <div className="flex justify-center py-10">
              <div className="w-16 h-16 rounded-full border-4 border-dark-surface-2 border-t-spotify-green animate-spin"></div>
            </div>
          )}
          
          {/* No results state */}
          {searchQuery && !isLoading && searchResults?.length === 0 && (
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold mb-2">Aucun résultat trouvé pour "{searchQuery}"</h2>
              <p className="text-text-secondary mb-6">Vérifiez l'orthographe ou essayez un autre terme de recherche</p>
              <button
                className="bg-spotify-green hover:bg-spotify-green-bright text-black font-medium py-2 px-6 rounded-full"
                onClick={handleUploadClick}
              >
                Télécharger de la musique
              </button>
            </div>
          )}
          
          {/* Search results */}
          {searchQuery && !isLoading && searchResults && searchResults.length > 0 && (
            <section>
              <TrackList tracks={searchResults} title={`Résultats pour "${searchQuery}"`} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
