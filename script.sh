#!/bin/bash
set -e

echo "🔄 Installation des dépendances npm..."
npm install

echo "🚀 Installation du navigateur Chrome via Puppeteer..."
npx puppeteer browsers install chrome

echo "✅ Chromium installé avec succès."

# Optionnel : export variable cache Puppeteer (si besoin)
export PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
echo "📂 Variable PUPPETEER_CACHE_DIR définie : $PUPPETEER_CACHE_DIR"

echo "▶️ Démarrage de l'application Node.js..."
npm start
