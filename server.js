const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const app = express();
const PORT = process.env.PORT || 8000;
const https = require('https');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
let pdfParse;
try { pdfParse = require('pdf-parse'); } catch (e) { pdfParse = null; }

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // autorise seulement ton front local
  credentials: true
}));

app.use(express.json());

// Servir les fichiers statiques (HTML, CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname)));

// Page d'accueil (redirige vers index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Exemple d'API (à compléter selon besoins)
// app.get('/api/hello', (req, res) => {
//   res.json({ message: 'Hello from server!' });
// });

function parseHorairesMesses(htmlString) {
    try {
        // Créer un DOM parser
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, "text/html");

        // 💡 Adapter le sélecteur à la structure réelle de ton HTML
        const horaireElements = doc.querySelectorAll('.horaire, .hours, .some-class-for-horaires');

        const horaires = [];

        horaireElements.forEach(el => {
            const texte = el.textContent.trim();
            if (texte) {
                horaires.push(texte);
            }
        });

        return horaires;
    } catch (error) {
        console.error("Erreur lors de l'extraction des horaires :", error);
        return []; // Retourne un tableau vide en cas d'erreur
    }
}

// Fonction de ping keep-alive
function pingKeepAlive() {
  https.get('https://prierenligne-github-io.onrender.com/', res => {
    console.log('Pinged prierenligne-github-io.onrender.com:', res.statusCode);
  }).on('error', err => {
    console.log('Ping error:', err.message);
  });
}

// Ping toutes les 5 minutes
setInterval(pingKeepAlive, 5 * 60 * 1000);
// Ping au démarrage
pingKeepAlive();

app.get('/api/horaires-messes', async (req, res) => {
    const ville = req.query.ville || 'Haguenau';
    const url = `https://messes.info/horaires/${encodeURIComponent(ville)}%20toutecelebration`;
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36");
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        // Sauvegarde le HTML juste après le goto
        const htmlAfterGoto = await page.content();
        fs.writeFileSync('horaires_after_goto.html', htmlAfterGoto, 'utf8');
        // await page.waitForSelector('.transitionAdminBar', { timeout: 15000 });
        // Ici tu sélectionnes la bonne classe — à adapter si besoin
        const data = await page.$$eval('.resultats', elements =>
            elements.map(el => el.textContent.trim()).filter(text => text)
        );
        console.log(data)
        // return horaires;
        // console.log("wait")
        // // Récupérer tout le HTML de la page
        // const articlesHTML = await page.evaluate(() => document.documentElement.outerHTML);
        // console.log("wait")
        // const data = parseHorairesMesses(articlesHTML)
        // console.log("wait")
        // console.log(data)
        // fs.writeFileSync('horaires_dump.html', articlesHTML, 'utf8');
        res.json({ success: true, html: data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (browser) await browser.close();
    }
});

// Proxy Magisterium API
app.post('/api/magisterium', async (req, res) => {
  try {
    const apiKey = "sk_mickae_d5257c104008450aaf7fdf265062b73b";
    if (!apiKey) {
      return res.status(500).json({ error: 'MAGISTERIUM_API_KEY not set in environment' });
    }
    const response = await fetch('https://www.magisterium.com/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint proxy pour la Bible AELF
app.get('/api/bible', async (req, res) => {
  try {
    const livre = req.query.livre;
    const chapitre = req.query.chapitre || 1;
    if (!livre) return res.status(400).json({ error: 'Paramètre livre manquant' });
    const url = `https://www.aelf.org/bible/${livre}/${chapitre}`;
    const response = await fetch(url);
    if (!response.ok) return res.status(500).json({ error: 'Erreur lors de la récupération du texte biblique' });
    const html = await response.text();
    const $ = cheerio.load(html);
    const rightCol = $('#right-col');
    // Supprimer la navigation des chapitres (div/ul/ol avec classes connues)
    rightCol.find('.chapters, .nav-chapitres, .chapitres, .pagination, .pagination-chapitres, .pagination__list').remove();
    // Supprimer aussi les liens de navigation "chapitre suivant", "précédent", etc.
    rightCol.find('a:contains("chapitre suivant"), a:contains("chapitre précédent")').remove();
    // Supprimer les éventuels <nav> ou <ul> contenant beaucoup de liens de chapitres
    rightCol.find('nav, ul, ol').each(function() {
      if ($(this).find('a').length > 10) $(this).remove();
    });
    // Supprimer le titre du chapitre (h1, h2, div ou p en haut qui contient le nom du livre ou 'chapitre')
    const firstH1 = rightCol.find('h1').first();
    if (firstH1.length) firstH1.remove();
    const firstH2 = rightCol.find('h2').first();
    if (firstH2.length) firstH2.remove();
    // Supprimer tout div ou p en haut qui ne contient que le numéro du chapitre ou le mot 'chapitre'
    rightCol.children('div, p').each(function(i, el) {
      const txt = $(el).text().trim().toLowerCase();
      if (/^chapitre(\s+\d+)?$/.test(txt) || /^\d+$/.test(txt)) {
        $(el).remove();
      }
    });
    const cleanedHtml = rightCol.html();
    if (!cleanedHtml) return res.status(404).json({ error: 'Texte biblique non trouvé' });
    res.json({ html: cleanedHtml });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour extraire le PDF du missel en HTML lisible
app.get('/api/missel-html', async (req, res) => {
  if (!pdfParse) return res.status(500).json({ error: 'pdf-parse n\'est pas installé' });
  try {
    const pdfPath = path.join(__dirname, 'missel-liturgie.pdf');
    if (!fs.existsSync(pdfPath)) return res.status(404).json({ error: 'Fichier PDF non trouvé' });
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    let text = data.text;
    // Conversion simple en HTML : titres, paragraphes
    // Titres : lignes en MAJUSCULES isolées
    let html = '';
    text.split(/\n{2,}/).forEach(block => {
      const trimmed = block.trim();
      if (!trimmed) return;
      if (/^[A-ZÉÈÊÎÔÛÄÖÜÇ\-\s]{6,}$/.test(trimmed) && trimmed.length < 80) {
        html += `<h2>${trimmed}</h2>`;
      } else {
        html += `<p>${trimmed.replace(/\n/g, ' ')}</p>`;
      }
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    res.status(500).json({ error: 'Erreur lors de la lecture du PDF' });
  }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
}); 