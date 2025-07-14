#!/bin/bash
set -e

echo "🔄 Installation des dépendances npm..."
npm install

echo "🚀 Installation du navigateur Chrome via Puppeteer..."

echo "✅ Chromium installé avec succès."

# Optionnel : export variable cache Puppeteer (si besoin)
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

npx puppeteer browsers install chrome


SRC_DIR="/opt/render/project/src/.cache/puppeteer/chrome"
TARGET_DIR="$PUPPETEER_CACHE_DIR/chrome"

# Crée les dossiers parents si besoin
mkdir -p "$PUPPETEER_CACHE_DIR"
mkdir -p "$SRC_DIR"
mkdir -p "$TARGET_DIR"

if [[ ! -d "$PUPPETEER_CACHE_DIR" ]]; then
    echo "⚠️ Pas de dossier Puppeteer cache, création et copie initiale..."
    # Ici on crée d'abord le cache, puis copie si le src existe
    if [[ -d "$SRC_DIR" ]]; then
        cp -r "$SRC_DIR/"* "$TARGET_DIR/"
        echo "✅ Copie initiale effectuée depuis SRC vers TARGET"
    else
        echo "🚫 Source $SRC_DIR introuvable, rien à copier"
    fi
else
    echo "✅ Dossier Puppeteer cache déjà présent, on synchronise vers SRC..."
    mkdir -p "$SRC_DIR"
    cp -r "$TARGET_DIR/"* "$SRC_DIR/" || echo "ℹ️ Aucun fichier à copier, dossier cible vide"
fi

echo "📂 Variable PUPPETEER_CACHE_DIR définie : $PUPPETEER_CACHE_DIR"

echo "▶️ Démarrage de l'application Node.js..."
npm start
