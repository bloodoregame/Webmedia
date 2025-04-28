# Corrections pour le déploiement Netlify

## Problème 1: Syntaxe de package.json

Le fichier `package.json` contient une erreur dans le script de build. Il faut le modifier pour cibler le bon répertoire de publication:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && cp -r netlify/functions dist/public/",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

## Problème 2: Configuration Netlify

Le fichier `netlify.toml` doit être mis à jour pour spécifier les bons chemins:

```toml
[build]
  command = "npm run build"
  publish = "dist/public"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Problème 3: Gestion des chemins d'API dans UploadModal.tsx

Le fichier `client/src/components/music/UploadModal.tsx` doit utiliser la constante `API_BASE` pour les requêtes API:

```tsx
// Au sommet du fichier (après les imports existants)
import { API_BASE } from "@/lib/config";

// Dans la fonction mutationFn
// ...
const formData = new FormData();
formData.append("file", file);
formData.append("title", title || "Untitled");
formData.append("artist", artist || "Unknown Artist");
if (album) formData.append("album", album);

// Send request to correct endpoint based on environment
const response = await fetch(`${API_BASE}/tracks`, {
  method: "POST",
  body: formData,
  credentials: "include"
});
// ...

// Dans onSuccess, mettre à jour l'invalidation du cache:
queryClient.invalidateQueries({ queryKey: [`${API_BASE}/tracks`] });
```

## Problème 4: Version de Node.js

Créez un fichier `.nvmrc` à la racine du projet avec le contenu suivant:

```
18
```

## Configuration dans l'interface Netlify

Assurez-vous que les paramètres suivants sont définis dans l'interface de déploiement Netlify:
- Base directory: (vide)
- Build command: `npm run build`
- Publish directory: `dist/public`
- Functions directory: `netlify/functions`