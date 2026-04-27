# =============================================================================
# Dockerfile - Image Docker Frontend MySchool (Angular 21)
# =============================================================================
# Strategie : multi-stage build pour obtenir une image finale tres legere.
#   - Stage 1 "builder" : image Node pour compiler l'app Angular
#   - Stage 2 "runner"  : image Nginx minimale qui sert uniquement le dist/
# Avantage : l'image finale ne contient AUCUN outil de build (plus securise,
# plus petite, plus rapide a deployer).
# =============================================================================

# -----------------------------------------------------------------------------
# STAGE 1 : Build de l'application Angular
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Dossier de travail dans le conteneur
WORKDIR /app

# On copie d'abord uniquement les manifests pour profiter du cache Docker :
# si package.json n'a pas change, la couche npm ci reste en cache.
COPY package.json package-lock.json ./

# Installation reproductible des dependances (utilise package-lock.json)
RUN npm ci

# On copie ensuite le reste du code source
COPY . .

# Build en mode production (sortie : dist/myschool-front/browser)
RUN npm run build

# -----------------------------------------------------------------------------
# STAGE 2 : Serveur Nginx pour servir les fichiers statiques
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# Configuration Nginx personnalisee (gzip + routage SPA)
# On ecrase la conf par defaut de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# On copie UNIQUEMENT le build final depuis l'etape builder
# (le dossier "browser" contient les assets compiles par Angular 21)
COPY --from=builder /app/dist/myschool-front/browser /usr/share/nginx/html

# Nginx ecoute sur le port 80 par defaut
EXPOSE 80

# Nginx tourne en foreground pour que Docker garde le container vivant
CMD ["nginx", "-g", "daemon off;"]
