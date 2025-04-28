# MusiStream - Streaming Musical Inspiré de Spotify

Application de streaming musical avec interface inspirée de Spotify permettant l'écoute et le téléchargement de musique.

## Caractéristiques

- Interface utilisateur moderne inspirée de Spotify
- Lecteur de musique complet avec contrôles de lecture
- Bibliothèque de musique et playlists
- Fonction de recherche et filtrage
- Téléchargement de nouveaux morceaux
- Interface entièrement en français

## Déploiement sur GitHub

1. Clonez le dépôt cible
```
git clone https://github.com/bloodoregame/Webmedia.git
cd Webmedia
```

2. Téléchargez le ZIP de votre projet depuis Replit (dans le menu ⋮ en haut à droite)
3. Extrayez le contenu du ZIP dans votre dossier local
4. Exécutez les commandes Git suivantes:
```
git add .
git commit -m "Initial commit of Spotify-like music streaming app"
git push origin main
```

## Déploiement sur Netlify

Pour déployer cette application sur Netlify, suivez ces étapes:

### Prérequis
Assurez-vous que ces fichiers sont présents dans votre projet:
- `netlify.toml` à la racine
- Dossier `netlify/functions` contenant `api.js` et `audio.js`
- Fichier `client/src/lib/config.ts` pour la configuration des URLs d'API

### Étapes de déploiement
1. Sur GitHub:
   - Assurez-vous que votre code est poussé sur GitHub

2. Sur Netlify:
   - Créez un compte sur [Netlify](https://www.netlify.com/) si vous n'en avez pas
   - Depuis le tableau de bord, cliquez sur "Add new site" > "Import an existing project"
   - Choisissez GitHub comme fournisseur Git
   - Sélectionnez votre dépôt `bloodoregame/Webmedia`
   - Dans les paramètres de build, configurez:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Cliquez sur "Deploy site"

3. Configuration supplémentaire:
   - Allez dans "Site settings" > "Functions" et vérifiez que le chemin est configuré sur "netlify/functions"
   - Dans l'onglet "Environment", vous pouvez ajouter des variables d'environnement si nécessaire

### Astuce pour les fichiers audio
Pour une application de production complète, vous devriez utiliser un service de stockage de fichiers (AWS S3, Cloudinary, etc.) pour les fichiers audio. La solution actuelle avec Netlify Functions offre une simulation pour démonstration seulement.

## Adaptation pour un environnement de production réel

Si vous souhaitez déployer cette application en production avec des fichiers audio réels:

1. **Service de stockage d'objets**:
   - Créez un compte sur AWS S3, Cloudinary ou un service similaire
   - Uploadez vos fichiers audio dans un bucket/dossier
   - Configurez les autorisations CORS appropriées

2. **Base de données**:
   - Remplacez le stockage en mémoire par une base de données réelle 
   - Options recommandées pour Netlify: FaunaDB, Supabase, ou MongoDB Atlas

3. **API Backend**:
   - Adaptez les fichiers dans `netlify/functions` pour se connecter à votre base de données
   - Mettez à jour les routes pour récupérer les fichiers depuis votre service de stockage

## Développement local

Pour exécuter ce projet localement:

```
npm install
npm run dev
```

L'application sera disponible sur http://localhost:5000

## Structure du projet

- `/client` - Code frontend React avec TypeScript
- `/server` - Backend Express.js
- `/uploads` - Stockage local des fichiers audio
- `/netlify` - Configuration pour le déploiement Netlify (fonctions serverless)
- `/shared` - Types et schémas partagés entre frontend et backend