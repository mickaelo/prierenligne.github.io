const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const app = express();
const PORT = process.env.PORT || 3000;
const https = require('https');

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

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
}); 