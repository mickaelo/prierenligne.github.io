#!/bin/bash
set -e

echo "🔄 Installation des dépendances npm..."
npm install

echo "🚀 Installation du navigateur Chrome via Puppeteer..."
npx puppeteer browsers install chrome

echo "✅ Chromium installé avec succès."

# Optionnel : export variable cache Puppeteer (si besoin)
export PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
if [[ ! -d $PUPPETEER_CACHE_DIR]]; then
    cp -r /opt/render/project/src/.cache/puppeteer/chrome/ $PUPPETEER_CACHE_DIR
else
    cp -r $PUPPETEER_CACHE_DIR /opt/render/project/src/.cache/puppeteer/chrome/

fi
echo "📂 Variable PUPPETEER_CACHE_DIR définie : $PUPPETEER_CACHE_DIR"

echo "▶️ Démarrage de l'application Node.js..."
npm start
