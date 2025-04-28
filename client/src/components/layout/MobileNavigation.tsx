import { Link, useLocation } from "wouter";
import { Home, Search, Library } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden flex justify-around items-center py-2 bg-black">
      <Link href="/">
        <div className="flex flex-col items-center text-center cursor-pointer">
          <Home className={`h-5 w-5 ${location === "/" ? "text-white" : "text-text-secondary"}`} />
          <span className={`text-xs mt-1 ${location === "/" ? "text-white" : "text-text-secondary"}`}>
            Accueil
          </span>
        </div>
      </Link>
      <Link href="/search">
        <div className="flex flex-col items-center text-center cursor-pointer">
          <Search className={`h-5 w-5 ${location === "/search" ? "text-white" : "text-text-secondary"}`} />
          <span className={`text-xs mt-1 ${location === "/search" ? "text-white" : "text-text-secondary"}`}>
            Rechercher
          </span>
        </div>
      </Link>
      <Link href="/library">
        <div className="flex flex-col items-center text-center cursor-pointer">
          <Library className={`h-5 w-5 ${location === "/library" ? "text-white" : "text-text-secondary"}`} />
          <span className={`text-xs mt-1 ${location === "/library" ? "text-white" : "text-text-secondary"}`}>
            Bibliothèque
          </span>
        </div>
      </Link>
    </div>
  );
}
