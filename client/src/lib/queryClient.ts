import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE } from "./config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Helper pour préfixer les URL d'API
const getApiUrl = (path: string): string => {
  // Vérifier si le chemin commence déjà par le bon préfixe
  if (path.startsWith(API_BASE)) {
    return path;
  }
  
  // Si le chemin commence par /api, remplacer par le préfixe API_BASE
  if (path.startsWith('/api')) {
    return `${API_BASE}${path.substring(4)}`;
  }

  // Sinon, ajouter simplement le préfixe
  return `${API_BASE}${path}`;
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Utiliser l'URL préfixée pour Netlify
  const apiUrl = getApiUrl(url);
  
  const res = await fetch(apiUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Traiter l'URL pour qu'elle fonctionne sur Netlify
    const url = getApiUrl(queryKey[0] as string);
    
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
