# Documentation Application Webmedia

## Déploiement sur Netlify

### Configuration de Base

Pour déployer correctement l'application sur Netlify, assurez-vous de respecter ces paramètres:

1. **Dans l'interface Netlify:**
   - Base directory: (vide)
   - Build command: `npm run build`
   - Publish directory: `dist/public`
   - Functions directory: `netlify/functions`

2. **Fichiers essentiels:**
   - `.nvmrc`: Contient "18" pour spécifier Node.js 18
   - `netlify.toml`: Configuration des redirections et paramètres de build

### Structure des Fichiers

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   │   └── config.ts (Configuration API)
│   │   └── ...
├── netlify/
│   └── functions/
│       ├── api.cjs (Functions pour l'API)
│       └── audio.cjs (Functions pour l'audio)
├── .nvmrc
└── netlify.toml
```

### Chemins API

L'application utilise des chemins différents selon l'environnement:

- **Développement local**: `/api/...`
- **Netlify**: `/.netlify/functions/api.cjs/...`

Cette logique est gérée dans le fichier `client/src/lib/config.ts`.

## Architecture de l'Application

### Frontend (React + TypeScript)

- **UI Components**: Utilisation de shadcn et Tailwind CSS
- **State Management**: Context API pour l'état global
- **API Requests**: TanStack Query (React Query)
- **Routing**: wouter pour la navigation

### Backend (Express + Netlify Functions)

- **API**: Express adapté pour les fonctions serverless
- **Storage**: Stockage en mémoire pour les prototypes, peut être remplacé par une base de données
- **File Handling**: Upload et streaming de fichiers audio

## Fonctionnalités

1. **Bibliothèque Musicale**
   - Affichage des pistes disponibles
   - Recherche de musique par titre, artiste ou album

2. **Lecture de Musique**
   - Lecteur audio avec contrôles (play, pause, skip)
   - Ajustement du volume
   - Progression de la lecture

3. **Upload de Musique**
   - Interface pour télécharger vos propres fichiers audio
   - Métadonnées: titre, artiste, album

4. **Playlists**
   - Création et gestion de playlists personnalisées
   - Ajout et suppression de pistes

## Améliorations Possibles

### Stockage Persistant

Remplacer le stockage en mémoire par une base de données:
- **FaunaDB**: Compatible avec Netlify et sans serveur
- **Supabase**: Alternatives PostgreSQL sans serveur
- **Firebase**: Solution complète avec authentification

### Stockage de Fichiers

Mettre en place un service de stockage pour les fichiers audio:
- **AWS S3**: Solution robuste pour le stockage d'objets
- **Cloudinary**: Spécialisé dans les médias avec transformations
- **Netlify Large Media**: Intégré à Netlify

### Authentification

Ajouter un système d'authentification:
- **Netlify Identity**: Service d'authentification intégré
- **Auth0**: Solution complète d'authentification
- **Firebase Auth**: Facile à intégrer

### Optimisations

- **Service Worker**: Pour le caching et l'expérience offline
- **Streaming Audio Adaptatif**: Qualité audio adaptée à la connexion
- **PWA**: Transformation en Progressive Web App

## Troubleshooting

### Problèmes courants

1. **Erreur d'upload de fichier**: Vérifiez que les chemins API dans config.ts sont corrects et que les redirections Netlify fonctionnent.

2. **Audio ne joue pas**: Le streaming audio sur Netlify Functions est limité. Envisagez d'utiliser un service dédié comme AWS S3 + CloudFront.

3. **Erreurs 404 sur les API**: Assurez-vous que les redirections dans `netlify.toml` sont correctes et pointent vers les fichiers .cjs.

4. **Build échoue**: Vérifiez la version de Node.js (utiliser Node 18) et assurez-vous que le script de build est correct.

### Logs et Debugging

- Netlify fournit des logs de build et de function qui peuvent être utiles pour débugger
- Utilisez la console du navigateur pour voir les erreurs côté client
- Ajoutez des logs dans les fonctions Netlify pour suivre l'exécution