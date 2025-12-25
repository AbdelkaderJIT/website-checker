# Étape 1 : Build de l'application
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste du code
COPY . .

# Build l'application Next.js
RUN npm run build

# Étape 2 : Image de production
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=9002
ENV PLAYWRIGHT_BROWSERS_PATH=/home/nextjs/.cache/ms-playwright

# Installer les dépendances système pour Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur non-root
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nextjs

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules

# Note: Le dossier public est optionnel dans Next.js 13+ avec App Router
# Si vous avez un dossier public, décommentez la ligne suivante:
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Créer le répertoire cache pour Playwright et définir les permissions
RUN mkdir -p /home/nextjs/.cache && chown -R nextjs:nodejs /home/nextjs

# Installer les navigateurs Playwright avec les bonnes permissions
RUN npx playwright install --with-deps chromium && \
    chown -R nextjs:nodejs /home/nextjs/.cache

# Changer l'ownership de tous les fichiers de l'app
RUN chown -R nextjs:nodejs /app

# Utiliser l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 9002

# Démarrer l'application
CMD ["node", "server.js"]

