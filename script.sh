#!/bin/bash
set -e

echo "🔄 Installation des dépendances npm..."
npm install

echo "🚀 Installation du navigateur Chrome via Puppeteer..."

# Définition du dossier cache Puppeteer
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p "$PUPPETEER_CACHE_DIR"

# Installer Chromium
npx puppeteer browsers install chrome

# Copier le cache vers / depuis le projet src si besoin
SRC_CACHE_DIR=/opt/render/project/src/.cache/puppeteer/chrome
TARGET_CACHE_DIR="$PUPPETEER_CACHE_DIR/chrome"

mkdir -p "$(dirname "$SRC_CACHE_DIR")"  # Création dossier parent

if [[ ! -d "$SRC_CACHE_DIR" ]]; then
    echo "Le dossier source $SRC_CACHE_DIR n'existe pas, rien à copier vers $PUPPETEER_CACHE_DIR"
else
    echo "Copie de $SRC_CACHE_DIR vers $TARGET_CACHE_DIR"
    mkdir -p "$TARGET_CACHE_DIR"
    cp -r "$SRC_CACHE_DIR/"* "$TARGET_CACHE_DIR/"
fi

echo "📂 Variable PUPPETEER_CACHE_DIR définie : $PUPPETEER_CACHE_DIR"

echo "▶️ Démarrage de l'application Node.js..."
npm start
