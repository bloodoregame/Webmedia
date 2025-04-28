import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Library from "@/pages/Library";
import MusicPlayer from "@/components/music/MusicPlayer";
import { useState } from "react";
import UploadModal from "@/components/music/UploadModal";
import { MusicProvider } from "./context/MusicContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/library" component={Library} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <MusicProvider>
        <TooltipProvider>
          <div className="flex flex-col h-screen overflow-hidden">
            <Router />
            <MusicPlayer />
            <UploadModal 
              isOpen={isUploadModalOpen} 
              onClose={() => setIsUploadModalOpen(false)} 
            />
            <Toaster />
          </div>
          
          {/* Global context for open/close modal */}
          <div id="openUploadModal" className="hidden" onClick={() => setIsUploadModalOpen(true)} />
        </TooltipProvider>
      </MusicProvider>
    </QueryClientProvider>
  );
}

export default App;
