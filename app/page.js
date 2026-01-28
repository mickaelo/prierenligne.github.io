"use client";
import { useState, useEffect, useRef } from "react";
import config from "../config.js";
import { marked } from "marked";
import Image from "next/image";

// Fonction utilitaire pour lier les références [^n] aux citations
function linkifyCitations(markdown, citations) {
  if (!citations || citations.length === 0) return marked.parse(markdown || "");
  // Remplace [^n] par un lien ancré
  return marked.parse(markdown || "").replace(/\[\^(\d+)\]/g, (match, n) => {
    const idx = parseInt(n, 10) - 1;
    if (citations[idx]) {
      return `<a href=\"#citation-${n}\" style=\"color:#ffe066;text-decoration:underline dotted;cursor:pointer;\">[^${n}]</a>`;
    }
    return match;
  });
}

export default function Home() {
  const [lectioOpen, setLectioOpen] = useState(false);
  const [messeOpen, setMesseOpen] = useState(false);
  const [chapeletOpen, setChapeletOpen] = useState(false);
  const [horairesOpen, setHorairesOpen] = useState(false);
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [prayerFilter, setPrayerFilter] = useState({
    language: 'all',
    category: 'all',
    saint: 'all',
    object: 'all'
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [bibleOpen, setBibleOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [showCandle, setShowCandle] = useState(false);
  const [candleProgress, setCandleProgress] = useState(1); // 1 = pleine, 0 = fondue
  const candleDuration = 10; // secondes
  const candleTimer = useRef(null);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const icons = [
    {
      label: "Jésus Christ",
      src: "/ChristNEWSmall__84409.jpg",
    },
    {
      label: "Sainte Marie",
      src: "/icone-sainte-vierge-marie.jpg",
    },
    {
      label: "Saint Joseph",
      src: "/icone-saint-joseph-enfant-jesus.jpg",
    },
    {
      label: "Sainte Famille",
      src: "/icone-de-la-sainte-famille.jpg",
    },
  ];
  const [selectedDuration, setSelectedDuration] = useState(10); // secondes par défaut
  const durations = [
    { label: '1 min', value: 10 },
    { label: '5 min', value: 300 },
    { label: '10 min', value: 600 },
  ];
  const [candleExtinguished, setCandleExtinguished] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [saintBio, setSaintBio] = useState(null);
  const [showSaintPopup, setShowSaintPopup] = useState(false);
  const [customDuration, setCustomDuration] = useState('');
  const [showChapeletHelp, setShowChapeletHelp] = useState(false);

  // Données des prières avec métadonnées
  const prayersData = [
    // Prière du Seigneur
    {
      id: 'notre-pere-fr',
      title: 'Notre Père (Français)',
      content: `Notre Père qui es aux cieux,<br/>
que ton nom soit sanctifié,<br/>
que ton règne vienne,<br/>
que ta volonté soit faite<br/>
sur la terre comme au ciel.<br/>
Donne-nous aujourd'hui notre pain de ce jour.<br/>
Pardonne-nous nos offenses<br/>
comme nous pardonnons aussi<br/>
à ceux qui nous ont offensés.<br/>
Et ne nous soumets pas à la tentation,<br/>
mais délivre-nous du mal.<br/>
Amen.`,
      language: 'french',
      category: 'seigneur',
      saint: null,
      object: 'priere-fondamentale'
    },
    {
      id: 'pater-noster-lat',
      title: 'Pater Noster (Latin)',
      content: `Pater noster, qui es in caelis,<br/>
sanctificetur nomen tuum.<br/>
Adveniat regnum tuum.<br/>
Fiat voluntas tua,<br/>
sicut in caelo et in terra.<br/>
Panem nostrum quotidianum da nobis hodie,<br/>
et dimitte nobis debita nostra,<br/>
sicut et nos dimittimus debitoribus nostris.<br/>
Et ne nos inducas in tentationem,<br/>
sed libera nos a malo.<br/>
Amen.`,
      language: 'latin',
      category: 'seigneur',
      saint: null,
      object: 'priere-fondamentale'
    },
    // Prières mariales
    {
      id: 'ave-maria-fr',
      title: 'Je vous salue Marie (Français)',
      content: `Je vous salue, Marie, pleine de grâces,<br/>
le Seigneur est avec vous,<br/>
vous êtes bénie entre toutes les femmes<br/>
et Jésus, le fruit de vos entrailles, est béni.<br/>
Sainte Marie, Mère de Dieu,<br/>
priez pour nous, pauvres pécheurs,<br/>
maintenant et à l'heure de notre mort.<br/>
Amen.`,
      language: 'french',
      category: 'marie',
      saint: null,
      object: 'priere-fondamentale'
    },
    {
      id: 'ave-maria-lat',
      title: 'Ave Maria (Latin)',
      content: `Ave Maria, gratia plena,<br/>
Dominus tecum.<br/>
Benedicta tu in mulieribus,<br/>
et benedictus fructus ventris tui, Iesus.<br/>
Sancta Maria, Mater Dei,<br/>
ora pro nobis peccatoribus,<br/>
nunc et in hora mortis nostrae.<br/>
Amen.`,
      language: 'latin',
      category: 'marie',
      saint: null,
      object: 'priere-fondamentale'
    },
    {
      id: 'sub-tuum-praesidium',
      title: 'Sous votre protection (Sub tuum praesidium)',
      content: `<strong>Français :</strong><br/>
Sous votre protection nous nous réfugions,<br/>
sainte Mère de Dieu.<br/>
Ne méprisez pas nos supplications<br/>
dans nos nécessités,<br/>
mais délivrez-nous de tous périls,<br/>
ô Vierge glorieuse et bénie.<br/><br/>
<strong>Latin :</strong><br/>
<em>Sub tuum praesidium confugimus,<br/>
Sancta Dei Genetrix.<br/>
Nostras deprecationes ne despicias<br/>
in necessitatibus,<br/>
sed a periculis cunctis libera nos semper,<br/>
Virgo gloriosa et benedicta.</em>`,
      language: 'bilingue',
      category: 'marie',
      saint: null,
      object: 'protection'
    },
    // Prières trinitaires
    {
      id: 'gloria-patri-fr',
      title: 'Gloire au Père (Français)',
      content: `Gloire au Père, et au Fils, et au Saint-Esprit,<br/>
comme il était au commencement,<br/>
maintenant et toujours,<br/>
et dans les siècles des siècles.<br/>
Amen.`,
      language: 'french',
      category: 'trinite',
      saint: null,
      object: 'priere-fondamentale'
    },
    {
      id: 'gloria-patri-lat',
      title: 'Gloria Patri (Latin)',
      content: `Gloria Patri, et Filio, et Spiritui Sancto,<br/>
sicut erat in principio,<br/>
et nunc, et semper,<br/>
et in saecula saeculorum.<br/>
Amen.`,
      language: 'latin',
      category: 'trinite',
      saint: null,
      object: 'priere-fondamentale'
    },
    // Actes de vertus
    {
      id: 'acte-foi',
      title: 'Acte de foi',
      content: `Mon Dieu, je crois fermement toutes les vérités<br/>
que vous avez révélées et que vous nous enseignez<br/>
par votre Église, parce que vous ne pouvez ni vous tromper<br/>
ni nous tromper. Je crois en vous, mon Dieu,<br/>
fortifiez ma foi.`,
      language: 'french',
      category: 'vertus',
      saint: null,
      object: 'vertu'
    },
    {
      id: 'acte-esperance',
      title: 'Acte d\'espérance',
      content: `Mon Dieu, j'espère avec une ferme confiance<br/>
que vous me donnerez, par les mérites de Jésus-Christ,<br/>
votre grâce en ce monde et le bonheur éternel<br/>
dans l'autre vie, parce que vous l'avez promis<br/>
et que vous tenez toujours vos promesses.`,
      language: 'french',
      category: 'vertus',
      saint: null,
      object: 'vertu'
    },
    {
      id: 'acte-charite',
      title: 'Acte de charité',
      content: `Mon Dieu, je vous aime de tout mon cœur<br/>
et par-dessus toutes choses, parce que vous êtes<br/>
infiniment bon et infiniment aimable,<br/>
et j'aime mon prochain comme moi-même<br/>
pour l'amour de vous.`,
      language: 'french',
      category: 'vertus',
      saint: null,
      object: 'vertu'
    },
    {
      id: 'acte-contrition',
      title: 'Acte de contrition',
      content: `Mon Dieu, j'ai un très grand regret de vous avoir offensé,<br/>
parce que vous êtes infiniment bon,<br/>
infiniment aimable, et que le péché vous déplaît.<br/>
Je prends la ferme résolution,<br/>
avec le secours de votre sainte grâce,<br/>
de ne plus vous offenser et de faire pénitence.`,
      language: 'french',
      category: 'vertus',
      saint: null,
      object: 'repentance'
    },
    // Prières de saints
    {
      id: 'priere-francois',
      title: 'Prière de saint François d\'Assise',
      content: `Seigneur, faites de moi un instrument de votre paix.<br/>
Là où il y a de la haine, que je mette l'amour.<br/>
Là où il y a l'offense, que je mette le pardon.<br/>
Là où il y a la discorde, que je mette l'union.<br/>
Là où il y a l'erreur, que je mette la vérité.<br/>
Là où il y a le doute, que je mette la foi.<br/>
Là où il y a le désespoir, que je mette l'espérance.<br/>
Là où il y a les ténèbres, que je mette votre lumière.<br/>
Là où il y a la tristesse, que je mette la joie.`,
      language: 'french',
      category: 'saints',
      saint: 'francois-assise',
      object: 'paix'
    },
    {
      id: 'priere-ignace',
      title: 'Prière de saint Ignace de Loyola',
      content: `Prenez, Seigneur, et recevez toute ma liberté,<br/>
ma mémoire, mon intelligence et toute ma volonté.<br/>
Tout ce que j'ai et possède,<br/>
c'est vous qui me l'avez donné :<br/>
à vous, Seigneur, je le rends.<br/>
Tout est vôtre, disposez-en selon votre entière volonté.<br/>
Donnez-moi votre amour et votre grâce,<br/>
c'est assez pour moi.`,
      language: 'french',
      category: 'saints',
      saint: 'ignace-loyola',
      object: 'offrande'
    },
    {
      id: 'priere-thomas',
      title: 'Prière de saint Thomas d\'Aquin',
      content: `<strong>Français :</strong><br/>
Je vous salue, ô précieux et très saint Corps de Jésus-Christ,<br/>
que je reçois maintenant,<br/>
et que je mange avec crainte et respect.<br/>
Que jamais je ne sois condamné pour vous avoir reçu indignement.<br/><br/>
<strong>Latin :</strong><br/>
<em>Ave, verum Corpus natum de Maria Virgine,<br/>
vere passum, immolatum in cruce pro homine,<br/>
cuius latus perforatum fluxit aqua et sanguine,<br/>
esto nobis praegustatum mortis in examine.</em>`,
      language: 'bilingue',
      category: 'saints',
      saint: 'thomas-aquin',
      object: 'eucharistie'
    },
    {
      id: 'priere-augustin',
      title: 'Prière de saint Augustin',
      content: `Seigneur, vous nous avez faits pour vous,<br/>
et notre cœur est sans repos<br/>
tant qu'il ne demeure en vous.<br/>
Donnez-nous la grâce de vous chercher<br/>
et de vous trouver,<br/>
afin que nous puissions vous aimer<br/>
et vous servir de tout notre cœur.`,
      language: 'french',
      category: 'saints',
      saint: 'augustin',
      object: 'recherche-dieu'
    },
    // Prières pour les défunts
    {
      id: 'requiem-aeternam',
      title: 'Requiem aeternam',
      content: `<strong>Français :</strong><br/>
Donnez-leur le repos éternel, Seigneur,<br/>
et que la lumière perpétuelle les éclaire.<br/>
Qu'ils reposent en paix. Amen.<br/><br/>
<strong>Latin :</strong><br/>
<em>Requiem aeternam dona eis, Domine,<br/>
et lux perpetua luceat eis.<br/>
Requiescant in pace. Amen.</em>`,
      language: 'bilingue',
      category: 'defunts',
      saint: null,
      object: 'defunts'
    },
    // Action de grâce
    {
      id: 'te-deum',
      title: 'Te Deum',
      content: `<strong>Français :</strong><br/>
Nous vous louons, ô Dieu, nous vous reconnaissons pour Seigneur.<br/>
À vous, Père éternel, toute la terre rend hommage.<br/>
Tous les anges, les cieux et toutes les puissances vous adorent.<br/>
Les chérubins et les séraphins proclament sans cesse :<br/>
"Saint, Saint, Saint est le Seigneur Dieu des armées !"<br/><br/>
<strong>Latin :</strong><br/>
<em>Te Deum laudamus, te Dominum confitemur.<br/>
Te aeternum Patrem omnis terra veneratur.<br/>
Tibi omnes Angeli, tibi caeli et universae Potestates.<br/>
Tibi Cherubim et Seraphim incessabili voce proclamant :<br/>
"Sanctus, Sanctus, Sanctus Dominus Deus Sabaoth !"</em>`,
      language: 'bilingue',
      category: 'action-grace',
      saint: null,
      object: 'louange'
    },
    // Credo
    {
      id: 'credo-fr',
      title: 'Credo (Symbole des Apôtres) - Français',
      content: `Je crois en Dieu, le Père tout-puissant,<br/>
créateur du ciel et de la terre.<br/>
Et en Jésus-Christ, son Fils unique, notre Seigneur,<br/>
qui a été conçu du Saint-Esprit,<br/>
est né de la Vierge Marie,<br/>
a souffert sous Ponce Pilate,<br/>
a été crucifié, est mort et a été enseveli,<br/>
est descendu aux enfers,<br/>
le troisième jour est ressuscité des morts,<br/>
est monté aux cieux,<br/>
est assis à la droite de Dieu le Père tout-puissant,<br/>
d'où il viendra juger les vivants et les morts.<br/>
Je crois en l'Esprit-Saint,<br/>
à la sainte Église catholique,<br/>
à la communion des saints,<br/>
à la rémission des péchés,<br/>
à la résurrection de la chair,<br/>
à la vie éternelle. Amen.`,
      language: 'french',
      category: 'seigneur',
      saint: null,
      object: 'priere-fondamentale'
    },
    {
      id: 'credo-lat',
      title: 'Credo (Symbolum Apostolorum) - Latin',
      content: `Credo in Deum Patrem omnipotentem,<br/>
Creatorem caeli et terrae.<br/>
Et in Iesum Christum, Filium eius unicum, Dominum nostrum,<br/>
qui conceptus est de Spiritu Sancto,<br/>
natus ex Maria Virgine,<br/>
passus sub Pontio Pilato,<br/>
crucifixus, mortuus et sepultus,<br/>
descendit ad inferos,<br/>
tertia die resurrexit a mortuis,<br/>
ascendit ad caelos,<br/>
sedet ad dexteram Dei Patris omnipotentis,<br/>
inde venturus est iudicare vivos et mortuos.<br/>
Credo in Spiritum Sanctum,<br/>
sanctam Ecclesiam catholicam,<br/>
sanctorum communionem,<br/>
remissionem peccatorum,<br/>
carnis resurrectionem,<br/>
vitam aeternam. Amen.`,
      language: 'latin',
      category: 'seigneur',
      saint: null,
      object: 'priere-fondamentale'
    },
    // Confiteor
    {
      id: 'confiteor-fr',
      title: 'Confiteor (J\'avoue à Dieu) - Français',
      content: `J'avoue à Dieu tout-puissant,<br/>
à la bienheureuse Marie toujours vierge,<br/>
à saint Michel archange,<br/>
à saint Jean-Baptiste,<br/>
aux saints apôtres Pierre et Paul,<br/>
à tous les saints,<br/>
et à vous, frères,<br/>
que j'ai beaucoup péché,<br/>
par pensées, par paroles et par actions,<br/>
par ma faute, par ma faute, par ma très grande faute.<br/>
C'est pourquoi je supplie la bienheureuse Marie toujours vierge,<br/>
saint Michel archange,<br/>
saint Jean-Baptiste,<br/>
les saints apôtres Pierre et Paul,<br/>
tous les saints,<br/>
et vous, frères,<br/>
de prier pour moi le Seigneur notre Dieu.`,
      language: 'french',
      category: 'repentance',
      saint: null,
      object: 'confession'
    },
    {
      id: 'confiteor-lat',
      title: 'Confiteor - Latin',
      content: `Confiteor Deo omnipotenti,<br/>
beatae Mariae semper Virgini,<br/>
beato Michaeli Archangelo,<br/>
beato Ioanni Baptistae,<br/>
sanctis Apostolis Petro et Paulo,<br/>
omnibus Sanctis,<br/>
et vobis, fratres,<br/>
quia peccavi nimis<br/>
cogitatione, verbo et opere,<br/>
mea culpa, mea culpa, mea maxima culpa.<br/>
Ideo precor beatam Mariam semper Virginem,<br/>
beatum Michaelem Archangelum,<br/>
beatum Ioannem Baptistam,<br/>
sanctos Apostolos Petrum et Paulum,<br/>
omnes Sanctos,<br/>
et vos, fratres,<br/>
orare pro me ad Dominum Deum nostrum.`,
      language: 'latin',
      category: 'repentance',
      saint: null,
      object: 'confession'
    },
    // Prières mariales supplémentaires
    {
      id: 'magnificat-fr',
      title: 'Magnificat (Cantique de Marie) - Français',
      content: `Mon âme exalte le Seigneur,<br/>
et mon esprit tressaille de joie en Dieu, mon Sauveur,<br/>
car il a porté son regard sur son humble servante.<br/>
Désormais, toutes les générations me diront bienheureuse,<br/>
car le Tout-Puissant a fait pour moi de grandes choses.<br/>
Son nom est saint,<br/>
et sa miséricorde s'étend d'âge en âge sur ceux qui le craignent.<br/>
Il a déployé la force de son bras,<br/>
il a dispersé les hommes au cœur superbe.<br/>
Il a renversé les puissants de leurs trônes<br/>
et élevé les humbles.<br/>
Il a rassasié de biens les affamés<br/>
et renvoyé les riches les mains vides.<br/>
Il a pris en pitié Israël, son serviteur,<br/>
se souvenant de sa miséricorde,<br/>
selon qu'il l'avait annoncé à nos pères,<br/>
en faveur d'Abraham et de sa descendance à jamais.`,
      language: 'french',
      category: 'marie',
      saint: null,
      object: 'louange'
    },
    {
      id: 'regina-caeli-fr',
      title: 'Regina Caeli (Reine du Ciel) - Français',
      content: `Reine du ciel, réjouissez-vous, alléluia,<br/>
car celui que vous avez mérité de porter, alléluia,<br/>
est ressuscité comme il l'avait dit, alléluia.<br/>
Priez Dieu pour nous, alléluia.`,
      language: 'french',
      category: 'marie',
      saint: null,
      object: 'paques'
    },
    {
      id: 'regina-caeli-lat',
      title: 'Regina Caeli - Latin',
      content: `Regina caeli, laetare, alleluia,<br/>
quia quem meruisti portare, alleluia,<br/>
resurrexit sicut dixit, alleluia.<br/>
Ora pro nobis Deum, alleluia.`,
      language: 'latin',
      category: 'marie',
      saint: null,
      object: 'paques'
    },
    {
      id: 'salve-regina-fr',
      title: 'Salve Regina (Je vous salue, Reine) - Français',
      content: `Je vous salue, Reine, Mère de miséricorde,<br/>
vie, douceur et espérance, notre salut.<br/>
Vers vous nous crions, enfants d'Ève exilés.<br/>
Vers vous nous soupirons, gémissant et pleurant<br/>
dans cette vallée de larmes.<br/>
Ô vous, notre avocate, tournez vers nous<br/>
vos regards miséricordieux.<br/>
Et, après cet exil, montrez-nous Jésus,<br/>
le fruit béni de vos entrailles.<br/>
Ô clémente, ô pieuse, ô douce Vierge Marie !`,
      language: 'french',
      category: 'marie',
      saint: null,
      object: 'intercession'
    },
    {
      id: 'salve-regina-lat',
      title: 'Salve Regina - Latin',
      content: `Salve Regina, Mater misericordiae,<br/>
vita, dulcedo et spes nostra, salve.<br/>
Ad te clamamus, exsules filii Evae.<br/>
Ad te suspiramus, gementes et flentes<br/>
in hac lacrimarum valle.<br/>
Eia ergo, advocata nostra, illos tuos<br/>
misericordes oculos ad nos converte.<br/>
Et Iesum, benedictum fructum ventris tui,<br/>
nobis post hoc exsilium ostende.<br/>
O clemens, o pia, o dulcis Virgo Maria !`,
      language: 'latin',
      category: 'marie',
      saint: null,
      object: 'intercession'
    },
    // Prières de saints supplémentaires
    {
      id: 'priere-bernard',
      title: 'Prière de saint Bernard de Clairvaux',
      content: `Souvenez-vous, ô très miséricordieuse Vierge Marie,<br/>
qu'on n'a jamais entendu dire qu'aucun de ceux<br/>
qui ont eu recours à votre protection,<br/>
imploré votre assistance ou réclamé votre secours,<br/>
ait été abandonné.<br/>
Animé d'une pareille confiance,<br/>
ô Vierge des vierges, ô ma Mère,<br/>
j'accours vers vous, et gémissant sous le poids<br/>
de mes péchés, je me prosterne à vos pieds.<br/>
Ô Mère du Verbe incarné,<br/>
ne rejetez pas mes prières,<br/>
mais écoutez-les favorablement et daignez les exaucer.`,
      language: 'french',
      category: 'saints',
      saint: 'bernard-clairvaux',
      object: 'intercession'
    },
    {
      id: 'priere-teresa',
      title: 'Prière de sainte Thérèse d\'Avila',
      content: `Que rien ne te trouble,<br/>
que rien ne t'effraie,<br/>
tout passe,<br/>
Dieu ne change pas,<br/>
la patience obtient tout,<br/>
celui qui possède Dieu<br/>
ne manque de rien :<br/>
Dieu seul suffit.`,
      language: 'french',
      category: 'saints',
      saint: 'therese-avila',
      object: 'confiance'
    },
    {
      id: 'priere-jean-paul',
      title: 'Prière de saint Jean-Paul II',
      content: `Marie, Mère de l'Église,<br/>
nous te confions l'Église tout entière<br/>
et chacun de nous.<br/>
Tu es la Mère de l'Église,<br/>
tu es la Mère de l'humanité.<br/>
Aide-nous à être des témoins<br/>
de l'amour du Christ<br/>
dans le monde d'aujourd'hui.<br/>
Amen.`,
      language: 'french',
      category: 'saints',
      saint: 'jean-paul-ii',
      object: 'eglise'
    },
    // Prières pour les malades
    {
      id: 'priere-malades',
      title: 'Prière pour les malades',
      content: `Seigneur Jésus, médecin de nos âmes et de nos corps,<br/>
vous qui avez guéri les malades<br/>
et consolé les affligés,<br/>
regardez avec compassion<br/>
tous ceux qui souffrent.<br/>
Donnez-leur la force de supporter<br/>
leurs épreuves avec patience,<br/>
et accordez-leur la guérison<br/>
selon votre sainte volonté.<br/>
Que votre présence les réconforte<br/>
et que votre paix les accompagne. Amen.`,
      language: 'french',
      category: 'malades',
      saint: null,
      object: 'guerison'
    },
    // Prières pour la famille
    {
      id: 'priere-famille',
      title: 'Prière pour la famille',
      content: `Sainte Famille de Nazareth,<br/>
Jésus, Marie et Joseph,<br/>
protégez notre famille.<br/>
Apprenez-nous à nous aimer<br/>
comme vous vous êtes aimés.<br/>
Aidez-nous à grandir dans la foi,<br/>
dans l'espérance et dans la charité.<br/>
Que notre foyer soit un lieu<br/>
de paix, de joie et d'amour.<br/>
Bénissez nos parents, nos enfants<br/>
et tous nos proches. Amen.`,
      language: 'french',
      category: 'famille',
      saint: null,
      object: 'famille'
    },
    // Prières pour la paix
    {
      id: 'priere-paix',
      title: 'Prière pour la paix',
      content: `Seigneur, fais de moi un instrument de ta paix.<br/>
Là où est la haine, que je mette l'amour.<br/>
Là où est l'offense, que je mette le pardon.<br/>
Là où est la discorde, que je mette l'union.<br/>
Là où est l'erreur, que je mette la vérité.<br/>
Là où est le doute, que je mette la foi.<br/>
Là où est le désespoir, que je mette l'espérance.<br/>
Là où sont les ténèbres, que je mette ta lumière.<br/>
Là où est la tristesse, que je mette la joie.`,
      language: 'french',
      category: 'paix',
      saint: null,
      object: 'paix'
    },
    // Prières pour les vocations
    {
      id: 'priere-vocations',
      title: 'Prière pour les vocations',
      content: `Seigneur Jésus, bon Pasteur,<br/>
tu as appelé les apôtres à te suivre<br/>
et à devenir pêcheurs d'hommes.<br/>
Appelle encore aujourd'hui<br/>
de nombreux jeunes<br/>
à te consacrer leur vie<br/>
dans le sacerdoce ou la vie religieuse.<br/>
Donne-leur la force de répondre<br/>
généreusement à ton appel.<br/>
Bénis les familles<br/>
qui encouragent leurs enfants<br/>
à suivre ta voie. Amen.`,
      language: 'french',
      category: 'vocations',
      saint: null,
      object: 'vocations'
    },
    // Prières pour les défunts
    {
      id: 'priere-defunts',
      title: 'Prière pour les défunts',
      content: `Seigneur, nous te confions nos frères et sœurs<br/>
qui ont quitté cette terre.<br/>
Accueille-les dans ton royaume<br/>
où il n'y a plus de larmes ni de souffrances.<br/>
Donne-leur le repos éternel<br/>
et que la lumière perpétuelle les éclaire.<br/>
Console leurs familles et leurs amis<br/>
dans leur deuil et leur tristesse.<br/>
Que nous nous retrouvions un jour<br/>
tous ensemble dans ta joie éternelle. Amen.`,
      language: 'french',
      category: 'defunts',
      saint: null,
      object: 'defunts'
    },
    // Prières de protection
    {
      id: 'priere-protection',
      title: 'Prière de protection',
      content: `Ange de Dieu, mon gardien,<br/>
à qui la bonté divine m'a confié,<br/>
éclaire-moi, garde-moi,<br/>
dirige-moi et gouverne-moi.<br/>
Amen.`,
      language: 'french',
      category: 'protection',
      saint: null,
      object: 'protection'
    },
    {
      id: 'priere-michel',
      title: 'Prière à saint Michel Archange',
      content: `Saint Michel Archange,<br/>
défendez-nous dans le combat,<br/>
soyez notre secours contre la malice<br/>
et les embûches du démon.<br/>
Que Dieu exerce sur lui son empire,<br/>
nous vous en supplions.<br/>
Et vous, prince de la milice céleste,<br/>
refoulez en enfer, par la force divine,<br/>
Satan et les autres esprits mauvais<br/>
qui rôdent dans le monde<br/>
pour la perte des âmes. Amen.`,
      language: 'french',
      category: 'saints',
      saint: 'michel-archange',
      object: 'protection'
    },
    // Prières d'action de grâce
    {
      id: 'action-grace-simple',
      title: 'Action de grâce simple',
      content: `Seigneur, je vous remercie<br/>
pour tous les bienfaits que vous me donnez<br/>
chaque jour de ma vie.<br/>
Merci pour ma famille, mes amis,<br/>
pour la santé, pour le travail,<br/>
pour tous les petits bonheurs quotidiens.<br/>
Aidez-moi à ne jamais oublier<br/>
que tout vient de vous<br/>
et à vous rendre grâce<br/>
en vivant selon votre volonté. Amen.`,
      language: 'french',
      category: 'action-grace',
      saint: null,
      object: 'remerciement'
    },
    // Prières pour les enfants
    {
      id: 'priere-enfants',
      title: 'Prière des enfants',
      content: `Mon Dieu, je vous aime<br/>
de tout mon petit cœur.<br/>
Bénissez papa et maman,<br/>
mes frères et sœurs,<br/>
mes grands-parents<br/>
et tous ceux que j'aime.<br/>
Aidez-moi à être sage<br/>
et à faire plaisir à tout le monde.<br/>
Merci pour tout ce que vous me donnez.<br/>
Amen.`,
      language: 'french',
      category: 'enfants',
      saint: null,
      object: 'enfants'
    }
  ];

  // Fonction de filtrage des prières
  const filteredPrayers = prayersData.filter(prayer => {
    const languageMatch = prayerFilter.language === 'all' || prayer.language === prayerFilter.language;
    const categoryMatch = prayerFilter.category === 'all' || prayer.category === prayerFilter.category;
    const saintMatch = prayerFilter.saint === 'all' || prayer.saint === prayerFilter.saint;
    const objectMatch = prayerFilter.object === 'all' || prayer.object === prayerFilter.object;

    return languageMatch && categoryMatch && saintMatch && objectMatch;
  });

  // Options pour les filtres
  const filterOptions = {
    language: [
      { value: 'all', label: 'Toutes les langues' },
      { value: 'french', label: 'Français' },
      { value: 'latin', label: 'Latin' },
      { value: 'bilingue', label: 'Bilingue' }
    ],
    category: [
      { value: 'all', label: 'Toutes les catégories' },
      { value: 'seigneur', label: 'Prière du Seigneur' },
      { value: 'marie', label: 'Prière à Marie' },
      { value: 'trinite', label: 'Prière à la Trinité' },
      { value: 'vertus', label: 'Actes de vertus' },
      { value: 'saints', label: 'Prière des saints' },
      { value: 'defunts', label: 'Prière pour les défunts' },
      { value: 'action-grace', label: 'Action de grâce' },
      { value: 'repentance', label: 'Repentance' },
      { value: 'malades', label: 'Malades' },
      { value: 'famille', label: 'Famille' },
      { value: 'paix', label: 'Paix' },
      { value: 'vocations', label: 'Vocations' },
      { value: 'protection', label: 'Protection' },
      { value: 'enfants', label: 'Enfants' }
    ],
    saint: [
      { value: 'all', label: 'Tous les saints' },
      { value: 'francois-assise', label: 'Saint François d\'Assise' },
      { value: 'ignace-loyola', label: 'Saint Ignace de Loyola' },
      { value: 'thomas-aquin', label: 'Saint Thomas d\'Aquin' },
      { value: 'augustin', label: 'Saint Augustin' },
      { value: 'bernard-clairvaux', label: 'Saint Bernard de Clairvaux' },
      { value: 'therese-avila', label: 'Sainte Thérèse d\'Avila' },
      { value: 'jean-paul-ii', label: 'Saint Jean-Paul II' },
      { value: 'michel-archange', label: 'Saint Michel Archange' }
    ],
    object: [
      { value: 'all', label: 'Tous les objets' },
      { value: 'priere-fondamentale', label: 'Prière fondamentale' },
      { value: 'protection', label: 'Protection' },
      { value: 'vertu', label: 'Vertu' },
      { value: 'repentance', label: 'Repentance' },
      { value: 'paix', label: 'Paix' },
      { value: 'offrande', label: 'Offrande' },
      { value: 'eucharistie', label: 'Eucharistie' },
      { value: 'recherche-dieu', label: 'Recherche de Dieu' },
      { value: 'defunts', label: 'Défunts' },
      { value: 'louange', label: 'Louange' },
      { value: 'confession', label: 'Confession' },
      { value: 'intercession', label: 'Intercession' },
      { value: 'paques', label: 'Pâques' },
      { value: 'guerison', label: 'Guérison' },
      { value: 'famille', label: 'Famille' },
      { value: 'vocations', label: 'Vocations' },
      { value: 'confiance', label: 'Confiance' },
      { value: 'eglise', label: 'Église' },
      { value: 'remerciement', label: 'Remerciement' },
      { value: 'enfants', label: 'Enfants' }
    ]
  };

  const [showDurationSelector, setShowDurationSelector] = useState(false);
  const [candleLit, setCandleLit] = useState(false); // Nouvel état : la bougie est-elle allumée ?

  // --- Lectures du jour (états et logique) ---
  const [lectioDate, setLectioDate] = useState(() => {
    const d = new Date();
    return d;
  });
  const [lectioLoading, setLectioLoading] = useState(false);
  const [lectioError, setLectioError] = useState(null);
  const [lectioInfo, setLectioInfo] = useState(null); // infos liturgiques
  const [lectioLectures, setLectioLectures] = useState([]);

  useEffect(() => {
    if (!lectioOpen) return;
    async function fetchReadings(date) {
      setLectioLoading(true);
      setLectioError(null);
      setLectioInfo(null);
      setLectioLectures([]);
      try {
        const formattedDate = date.toISOString().split('T')[0];
        const res = await fetch(`https://api.aelf.org/v1/messes/${formattedDate}/france`);
        if (!res.ok) throw new Error('Erreur réseau');
        const data = await res.json();
        // Infos liturgiques
        let info = [];
        if (data.informations) {
          if (data.informations.ligne1) info.push(data.informations.ligne1);
        }
        // Ajout du saint du jour via nominis
        try {
          const d = date;
          const saintRes = await fetch(`https://nominis.cef.fr/json/saintdujour.php?jour=${d.getDate()}&mois=${d.getMonth() + 1}&annee=${d.getFullYear()}`);
          if (saintRes.ok) {
            const saintData = await saintRes.json();
            if (saintData && saintData.response.saintdujour && saintData.response.saintdujour.nom) {
              info.push(saintData.response.saintdujour.nom);
              let bioHtml = saintData.response.saintdujour.contenu || null;
              if (bioHtml) {
                // Replace src="/... by src="https://nominis.cef.fr/...
                bioHtml = bioHtml.replace(/src=("|')\/(?!\/)/g, 'src=$1https://nominis.cef.fr/');
              }
              setSaintBio(bioHtml);
            }
          }
        } catch (e) {
          // ignore saint du jour error
        }
        setLectioInfo(info);
        // Lectures
        if (data.messes && data.messes[0] && data.messes[0].lectures) {
          setLectioLectures(data.messes[0].lectures);
        } else {
          setLectioLectures([]);
        }
      } catch (e) {
        setLectioError('Impossible de charger les lectures.');
      } finally {
        setLectioLoading(false);
      }
    }
    fetchReadings(lectioDate);
  }, [lectioOpen, lectioDate]);

  // Couleurs du styles.css d'origine
  const bg = "white";
  const text = "#fff";
  const btnBg = "rgb(139, 69, 19)";
  const btnBorder = "1px solid rgba(255,255,255,0.2)";
  const btnHoverBg = "rgba(255,255,255,0.2)";
  const panelBg = "#181818"; // fond bien opaque

  // Animation de fonte de la bougie
  useEffect(() => {
    if (candleLit) {
      setCandleProgress(1);
      setCandleExtinguished(false);
      let start = Date.now();
      function tick() {
        const elapsed = (Date.now() - start) / 1000;
        let progress;
        if (selectedDuration === null) {
          progress = 1;
        } else {
          progress = Math.max(0, 1 - elapsed / selectedDuration);
        }
        setCandleProgress(progress);
        if (progress > 0) {
          candleTimer.current = requestAnimationFrame(tick);
        } else if (selectedDuration !== null) {
          setCandleExtinguished(true);
          setTimeout(() => {
            setCandleLit(false); // Éteindre la bougie
            setCandleExtinguished(false);
          }, 1200); // laisse la fumée 1.2s
        }
      }
      candleTimer.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(candleTimer.current);
    } else {
      setCandleProgress(1);
      setCandleExtinguished(false);
      cancelAnimationFrame(candleTimer.current);
    }
  }, [candleLit, selectedDuration]);

  // Nouveau composant Candle simple
  function Candle() {
    // Flamme visible seulement si candleLit
    return (
      <div style={{ position: 'fixed', left: '50%', top: '75%', zIndex: 50, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
        <div style={{ width: 40, height: 120, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Flamme */}
          {candleLit && (
            <div style={{ width: 20, height: 32, position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
              <div style={{ width: 20, height: 32, background: 'radial-gradient(ellipse at center, #fffbe6 60%, #ffd700 100%)', borderRadius: '50% 50% 40% 40%', filter: 'blur(1px)', opacity: 0.85 }} />
            </div>
          )}
          {/* Mèche blanche à bord noir, dépassant de la cire */}
          <div style={{ width: 2, height: 16, background: '#fff', border: '1px solid #222', position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 2, borderRadius: 1 }} />
          {/* Corps de la bougie (cire) */}
          <div style={{ width: 24, height: 80, background: '#f3bf00', borderRadius: 12, marginTop: 48, boxShadow: '0 2px 8px #0006', border: '1px solid #ffe066' }} />
        </div>
      </div>
    );
  }

  // --- Formatage de la réponse du chatbot ---
  function formatResponse(response) {
    let formattedText = '';
    if (response.reponse && Array.isArray(response.reponse)) {
      response.reponse.forEach(part => {
        switch (part.type) {
          case 'intro':
            formattedText += `[Introduction]\n${part.text}\n\n`;
            break;
          case 'bible':
            formattedText += `[Bible]\n📖 ${part.text}\n\n`;
            break;
          case 'peres':
            formattedText += `[Pères de l'Église]\n👨‍🦳 ${part.text}\n\n`;
            break;
          case 'magistere':
            formattedText += `[Magistère]\n📚 ${part.text}\n\n`;
            break;
          case 'papes':
            formattedText += `[Papes]\n👑 ${part.text}\n\n`;
            break;
          default:
            formattedText += `${part.text}\n\n`;
        }
      });
    }
    if (response.references && response.references.length > 0) {
      formattedText += '[Références]\n📚\n';
      response.references.forEach(ref => {
        formattedText += `- ${ref.description}\n`;
      });
    }
    return formattedText.trim();
  }

  // --- Chatbot : envoi de question à l'API ---
  async function sendChatbotQuestion(question) {
    setChatMessages((msgs) => [...msgs, { from: "user", text: question }]);
    setChatInput("");
    setChatMessages((msgs) => [...msgs, { from: "bot", text: "..." }]); // loading
    try {
      const apiKey = (typeof config !== 'undefined' && config.MAGISTERIUM_API_KEY) ? config.MAGISTERIUM_API_KEY : (process.env.MAGISTERIUM_API_KEY || '');
      const response = await fetch('/api/magisterium', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'magisterium-1',
          messages: [
            { role: 'user', content: question }
          ],
          stream: false
        })
      });
      if (!response.ok) throw new Error('Erreur lors de la requête');
      const data = await response.json();
      setChatMessages((msgs) => [
        ...msgs.slice(0, -1),
        {
          from: "bot",
          text: data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : "Désolé, je n'ai pas pu traiter votre question. Veuillez réessayer.",
          citations: data.citations || []
        }
      ]);
    } catch (error) {
      setChatMessages((msgs) => [
        ...msgs.slice(0, -1),
        { from: "bot", text: "Désolé, une erreur est survenue. Veuillez réessayer plus tard." }
      ]);
    }
  }

  function handleSendChat(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatbotQuestion(chatInput);
  }

  // --- Chapelet : mystères du jour avec navigation ---
  const joursSemaine = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  const [chapeletDate, setChapeletDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const chapeletIdx = chapeletDate.getDay();
  const chapeletJour = joursSemaine[chapeletIdx];
  function getMystereDuJour(jour = chapeletJour) {
    return config.mysteres.find(m => m.jours.includes(jour));
  }
  const mystereChapelet = getMystereDuJour();

  // Prières du chapelet (français/latin)
  const prayers = [
    {
      title: "Je crois en Dieu / Credo",
      fr: `Je crois en Dieu, le Père tout-puissant, Créateur du ciel et de la terre. Et en Jésus-Christ, son Fils unique, notre Seigneur, qui a été conçu du Saint-Esprit, est né de la Vierge Marie, a souffert sous Ponce Pilate, a été crucifié, est mort et a été enseveli, est descendu aux enfers, le troisième jour est ressuscité des morts, est monté aux cieux, est assis à la droite de Dieu le Père tout-puissant, d'où il viendra juger les vivants et les morts. Je crois en l'Esprit-Saint, à la sainte Église catholique, à la communion des saints, à la rémission des péchés, à la résurrection de la chair, à la vie éternelle. Amen.`,
      la: `Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae. Et in Iesum Christum, Filium eius unicum, Dominum nostrum, qui conceptus est de Spiritu Sancto, natus ex Maria Virgine, passus sub Pontio Pilato, crucifixus, mortuus, et sepultus, descendit ad inferos, tertia die resurrexit a mortuis, ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis, inde venturus est iudicare vivos et mortuos. Credo in Spiritum Sanctum, sanctam Ecclesiam catholicam, sanctorum communionem, remissionem peccatorum, carnis resurrectionem, vitam aeternam. Amen.`
    },
    {
      title: "Notre Père / Pater Noster",
      fr: `Notre Père qui es aux cieux, que ton nom soit sanctifié, que ton règne vienne, que ta volonté soit faite sur la terre comme au ciel. Donne-nous aujourd'hui notre pain de ce jour. Pardonne-nous nos offenses, comme nous pardonnons aussi à ceux qui nous ont offensés. Et ne nous soumets pas à la tentation, mais délivre-nous du mal. Amen.`,
      la: `Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra. Panem nostrum quotidianum da nobis hodie, et dimitte nobis debita nostra sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem, sed libera nos a malo. Amen.`
    },
    {
      title: "Je vous salue Marie / Ave Maria",
      fr: `Je vous salue Marie, pleine de grâce, le Seigneur est avec vous. Vous êtes bénie entre toutes les femmes et Jésus, le fruit de vos entrailles, est béni. Sainte Marie, Mère de Dieu, priez pour nous pauvres pécheurs, maintenant et à l'heure de notre mort. Amen.`,
      la: `Ave Maria, gratia plena, Dominus tecum. Benedicta tu in mulieribus, et benedictus fructus ventris tui, Iesus. Sancta Maria, Mater Dei, ora pro nobis peccatoribus, nunc et in hora mortis nostrae. Amen.`
    },
    {
      title: "Gloire au Père / Gloria Patri",
      fr: `Gloire au Père, au Fils et au Saint-Esprit, comme il était au commencement, maintenant et toujours, et dans les siècles des siècles. Amen.`,
      la: `Gloria Patri, et Filio, et Spiritui Sancto. Sicut erat in principio, et nunc, et semper, et in saecula saeculorum. Amen.`
    }
  ];
  const [prayerLang, setPrayerLang] = useState('fr');
  // État pour l'ouverture/fermeture des prières du chapelet
  const [openPrayers, setOpenPrayers] = useState(() => prayers.map(() => false));
  function togglePrayer(idx) {
    setOpenPrayers(op => op.map((v, i) => i === idx ? !v : v));
  }

  // --- Horaires des messes ---
  const [horairesLeftOpen, setHorairesLeftOpen] = useState(false);
  const [horairesVille, setHorairesVille] = useState("");
  const [horairesSuggestions, setHorairesSuggestions] = useState([]);
  const [horairesLoading, setHorairesLoading] = useState(false);
  const [horairesResult, setHorairesResult] = useState(null);
  const [horairesError, setHorairesError] = useState(null);
  const [horairesGeoLoading, setHorairesGeoLoading] = useState(false);
  const horairesInputRef = useRef();
  const [isSuggestionsHovered, setIsSuggestionsHovered] = useState(false);
  // Suggestions ville (Nominatim)
  useEffect(() => {
    if (horairesVille.length < 2) {
      setHorairesSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const fetchSuggestions = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(horairesVille)}&countrycodes=fr&format=json&limit=5`;
        const resp = await fetch(url, { headers: { 'Accept-Language': 'fr' }, signal: controller.signal });
        const data = await resp.json();
        setHorairesSuggestions(data);
      } catch { }
    };
    const timeout = setTimeout(fetchSuggestions, 300);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [horairesVille]);

  // Close suggestions only if neither input nor dropdown is focused/hovered
  function handleInputBlur() {
    setTimeout(() => {
      if (!isSuggestionsHovered) setHorairesSuggestions([]);
    }, 100);
  }
  function handleInputFocus() {
    if (horairesVille.length >= 2 && horairesSuggestions.length === 0) {
      // Optionally re-trigger suggestions on focus
    }
  }
  // Recherche horaires par ville
  async function fetchHorairesForVille(ville) {
    setHorairesLoading(true);
    setHorairesError(null);
    setHorairesResult(null);
    try {
      const resp = await fetch(`/api/horaires-messes?ville=${encodeURIComponent(ville)}`);
      const data = await resp.json();
      if (data.success) {
        // data.html[0] ou data.html
        setHorairesResult(data.html[0] || data.html);
      } else {
        setHorairesError(data.error || "Erreur inconnue");
      }
    } catch {
      setHorairesError("Erreur lors de la récupération des horaires.");
    } finally {
      setHorairesLoading(false);
    }
  }
  // Géolocalisation
  async function handleGeoLoc() {
    setHorairesGeoLoading(true);
    setHorairesError(null);
    setHorairesResult(null);
    if (!navigator.geolocation) {
      setHorairesError("Géolocalisation non supportée.");
      setHorairesGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords;
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
        const resp = await fetch(url);
        const data = await resp.json();
        const ville = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || '';
        const postcode = data.address?.postcode ? data.address?.postcode.slice(0, 2) : '';

        if (ville) {
          await fetchHorairesForVille(`.fr%20${postcode}%20${ville.replace(/ /g, '%20')}`);
        } else {
          setHorairesError("Ville non trouvée à partir de votre position.");
        }
      } catch {
        setHorairesError("Erreur lors de la géolocalisation.");
      } finally {
        setHorairesGeoLoading(false);
      }
    }, err => {
      console.log(err)
      setHorairesError("Erreur de géolocalisation.");
      setHorairesGeoLoading(false);
    });
  }

  // --- Formatage horaires de messe (parse + html) ---
  function parseHorairesEtLieux(bigString) {
    console.log(bigString)
    let cleanedText = bigString
      .replace(/Horaires de la paroisse\s*Signalez une erreur/g, '')
      .replace(/Pas d'horaire disponible/g, '')
      .replace(/Afficher plus de lignes/g, '');

    const dayAbbr = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
    const dayPattern = `(?:${dayAbbr.join('|')})\\. \\d{1,2} [a-zéû]{3,4}\\.?(?: \\d{4})?`;
    cleanedText = cleanedText.replace(new RegExp(`(${dayPattern})`, 'gi'), '\n$1');

    const dateBlocks = cleanedText.split(/\n(?=(?:lun|mar|mer|jeu|ven|sam|dim)\. \d{1,2} [a-zéû]{3,4}\.? ?\d{0,4})/i);

    const result = [];

    const regexHoraireLieu = /(\d{1,2}h\d{2}\s+-\s+Messe [^0-9\n]+?)\s+(.+?\d{5}\s+[A-ZÉÈÊÎÔÛÄÖÜ\- ]+)/g;

    for (const block of dateBlocks) {
      if (!block.trim()) continue;

      const dateMatch = block.match(/^((?:lun|mar|mer|jeu|ven|sam|dim)\. \d{1,2} [a-zéû]{3,4}\.? ?\d{0,4})/i);
      const date = dateMatch ? dateMatch[1].trim() : null;
      if (!date) continue;

      const horairesBlock = block.replace(date, '').trim();

      let match;
      while ((match = regexHoraireLieu.exec(horairesBlock)) !== null) {
        const horaire = match[1].trim();
        const lieu = match[2].trim();
        result.push({ date, horaire, lieu });
      }
    }

    return result;
  }
  function generateHorairesHTML(horairesList) {
    console.log(horairesList)
    const groupedByDate = horairesList.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    }, {});
    let html = '';
    for (const date of Object.keys(groupedByDate)) {
      html += `<div class='mb-6'>`;
      html += `<div class='text-lg font-bold text-yellow-300 mb-2'>${date}</div>`;
      groupedByDate[date].forEach(item => {
        html += `<div class='bg-[#181818] rounded-lg p-3 shadow border border-neutral-800 mb-2 flex flex-col gap-1'>`;
        html += `<div class='text-base font-bold text-yellow-200'><span class='messe-heure'>${item.horaire}</span></div>`;
        html += `<div class='text-sm text-yellow-100'><span class='messe-lieu'>${item.lieu}</span></div>`;
        html += `</div>`;
      });
      html += `</div>`;
    }
    return html;
  }

  // --- Liturgie de la messe : parsing, navigation et style ---
  function parseMesseSections(txt) {
    // Découpe en sections sur les titres en MAJUSCULES (hors LITURGIE DE LA MESSE)
    const lines = txt.split(/\r?\n/);
    const sections = [];
    let current = { title: '', content: [] };
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      if (/^[A-ZÉÈÊÎÔÛÄÖÜÇ\- ]{4,}$/.test(l) && l !== 'LITURGIE DE LA MESSE') {
        if (current.title || current.content.length) sections.push({ ...current });
        current = { title: l, content: [] };
      } else {
        current.content.push(lines[i]);
      }
    }
    if (current.title || current.content.length) sections.push({ ...current });
    // Nettoie les sections vides
    return sections.filter(s => s.title || s.content.join('').trim());
  }
  // --- Liturgie de la messe : chargement du texte ---
  const [messeTexte, setMesseTexte] = useState(null);
  const [messeLoading, setMesseLoading] = useState(false);
  const [messeError, setMesseError] = useState(null);
  const [showMisselPdf, setShowMisselPdf] = useState(false);
  const [showMisselHtml, setShowMisselHtml] = useState(false);
  const [misselHtml, setMisselHtml] = useState(null);
  const [misselHtmlLoading, setMisselHtmlLoading] = useState(false);
  const [misselHtmlError, setMisselHtmlError] = useState(null);

  useEffect(() => {
    if (!messeOpen) return;
    setMesseLoading(true);
    setMesseError(null);
    fetch('/liturgie-messe.txt')
      .then(r => r.ok ? r.text() : Promise.reject('Erreur de chargement'))
      .then(txt => setMesseTexte(txt))
      .catch(() => setMesseError('Impossible de charger le texte.'))
      .finally(() => setMesseLoading(false));
  }, [messeOpen]);

  // Animated ellipsis for loading
  function AnimatedEllipsis() {
    const [count, setCount] = useState(0);
    useEffect(() => {
      const interval = setInterval(() => setCount(c => (c + 1) % 4), 400);
      return () => clearInterval(interval);
    }, []);
    return <span>{'.'.repeat(count)}</span>;
  }

  const [chatExtended, setChatExtended] = useState(false);
  const [lectioExtended, setLectioExtended] = useState(false);
  const [messeExtended, setMesseExtended] = useState(false);
  const [chapeletExtended, setChapeletExtended] = useState(false);
  const [horairesExtended, setHorairesExtended] = useState(false);
  const [bibleExtended, setBibleExtended] = useState(false);
  const [bibleContent, setBibleContent] = useState(null);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [bibleError, setBibleError] = useState(null);
  const [bibleCurrentBook, setBibleCurrentBook] = useState(null); // { code, name, maxChapitre }
  const [bibleCurrentChapitre, setBibleCurrentChapitre] = useState(1);
  const [bibleMaxChapitre, setBibleMaxChapitre] = useState(1);

  // --- Navigation Bible ---
  const bibleBooks = {
    "Ancien Testament": [
      "Livre de la Genèse", "Livre de l'Exode", "Livre du Lévitique", "Livre des Nombres", "Livre du Deutéronome", "Livre de Josué", "Livre des Juges", "Livre de Ruth", "Premier livre de Samuel", "Deuxième livre de Samuel", "Premier livre des Rois", "Deuxième livre des Rois", "Premier livre des Chroniques", "Deuxième livre des Chroniques", "Livre d'Esdras", "Livre de Néhémie", "Livre de Tobie", "Livre de Judith", "Livre d'Esther", "Premier Livre des Martyrs d'Israël", "Deuxième Livre des Martyrs d'Israël", "Livre de Job", "Livre des Proverbes", "L'ecclésiaste", "Cantique des cantiques", "Livre de la Sagesse", "Livre de Ben Sira le Sage", "Livre d'Isaïe", "Livre de Jérémie", "Livre des lamentations de Jérémie", "Livre de Baruch", "Lettre de Jérémie", "Livre d'Ezekiel", "Livre de Daniel", "Livre d'Osée", "Livre de Joël", "Livre d'Amos", "Livre d'Abdias", "Livre de Jonas", "Livre de Michée", "Livre de Nahum", "Livre d'Habaquc", "Livre de Sophonie", "Livre d'Aggée", "Livre de Zacharie", "Livre de Malachie"
    ],
    "Nouveau Testament": [
      "Evangile de Jésus-Christ selon saint Matthieu", "Evangile de Jésus-Christ selon saint Marc", "Evangile de Jésus-Christ selon saint Luc", "Evangile de Jésus-Christ selon saint Jean", "Livre des Actes des Apôtres", "Lettre de saint Paul Apôtre aux Romains", "Première lettre de saint Paul Apôtre aux Corinthiens", "Deuxième lettre de saint Paul Apôtre aux Corinthiens", "Lettre de saint Paul Apôtre aux Galates", "Lettre de saint Paul Apôtre aux Ephésiens", "Lettre de saint Paul Apôtre aux Philippiens", "Lettre de saint Paul Apôtre aux Colossiens", "Première lettre de saint Paul Apôtre aux Thessaloniciens", "Deuxième lettre de saint Paul Apôtre aux Thessaloniciens", "Première lettre de saint Paul Apôtre à Timothée", "Deuxième lettre de saint Paul Apôtre à Timothée", "Lettre de saint Paul Apôtre à Tite", "Lettre de saint Paul Apôtre à Philémon", "Lettre aux Hébreux", "Lettre de saint Jacques Apôtre", "Première lettre de saint Pierre Apôtre", "Deuxième lettre de saint Pierre Apôtre", "Première lettre de saint Jean", "Deuxième lettre de saint Jean", "Troisième lettre de saint Jean", "Lettre de saint Jude", "Livre de l'Apocalypse"
    ],
    "Psaumes": [
      ...[...Array(150)].map((_, i) => {
        const n = i + 1;
        if (n === 9) return ["9A", "9B"];
        if (n === 113) return ["113A", "113B"];
        return n;
      }).flat()
    ]
  };

  // Gestion du clic sur Livre de la Genèse
  async function handleClickBibleBook(book) {
    if (book === "Livre de la Genèse") {
      setBibleCurrentBook({ code: 'gn', name: book, maxChapitre: 50 });
      setBibleCurrentChapitre(1);
      setBibleMaxChapitre(50);
      fetchBibleText('gn', 1);
    } else {
      setBibleContent(null);
      setBibleError(null);
      setBibleCurrentBook(null);
      setBibleCurrentChapitre(1);
      setBibleMaxChapitre(1);
    }
  }

  // Fonction pour charger un texte biblique donné un code livre et un chapitre
  async function fetchBibleText(code, chapitre) {
    setBibleLoading(true);
    setBibleError(null);
    setBibleContent(null);
    try {
      const resp = await fetch(`/api/bible?livre=${code}&chapitre=${chapitre}`);
      const data = await resp.json();
      if (data.html) {
        setBibleContent(data.html);
      } else {
        setBibleError(data.error || "Erreur inconnue");
      }
    } catch (e) {
      setBibleError("Erreur lors de la récupération du texte.");
    } finally {
      setBibleLoading(false);
    }
  }

  // Gestion ouverture/fermeture exclusive des volets gauche/droite
  function closeAllLeftPanels() {
    setChatOpen(false);
    setLectioOpen(false);
    setHorairesLeftOpen(false);
    setPrayerOpen(false);
  }
  function closeAllRightPanels() {
    setMesseOpen(false);
    setChapeletOpen(false);
    setBibleOpen(false);
  }

  async function handleShowMisselHtml() {
    setShowMisselHtml(true);
    setShowMisselPdf(false);
    setMisselHtmlLoading(true);
    setMisselHtmlError(null);
    setMisselHtml(null);
    try {
      const resp = await fetch('/api/missel-html');
      if (resp.ok) {
        const html = await resp.text();
        setMisselHtml(html);
      } else {
        setMisselHtmlError('Erreur lors du chargement du missel.');
      }
    } catch {
      setMisselHtmlError('Erreur lors du chargement du missel.');
    } finally {
      setMisselHtmlLoading(false);
    }
  }

  // Radio Maria
  const [showRadio, setShowRadio] = useState(false);
  const [radioPlaying, setRadioPlaying] = useState(false);
  const radioRef = useRef(null);
  function toggleRadio() {
    setShowRadio(v => !v);
    setRadioPlaying(false);
    if (radioRef.current) radioRef.current.pause();
  }
  function handleRadioPlayPause() {
    if (!radioRef.current) return;
    if (radioPlaying) {
      radioRef.current.pause();
      setRadioPlaying(false);
    } else {
      radioRef.current.play();
      setRadioPlaying(true);
    }
  }

  // Radios disponibles
  const radios = [
    {
      name: 'Radio Maria France',
      url: 'https://dreamsiteradiocp6.com/proxy/rmfrance1?mp=/stream',
    },
    {
      name: 'Radio Notre Dame',
      url: 'https://rcf.streamakaci.com/rcfdigital.mp3?_ic2=1752677672433',
    },
  ];
  const [selectedRadio, setSelectedRadio] = useState(radios[0]);
  useEffect(() => {
    if (showRadio && radioRef.current) {
      radioRef.current.load();
      if (radioPlaying) {
        radioRef.current.play();
      }
    }
    // eslint-disable-next-line
  }, [selectedRadio]);

  // --- Radio Maria : programme et encart "En direct" ---
  function parseHmToMinutes(hm) {
    const [h, m] = hm.split(":").map(Number);
    return h * 60 + m;
  }

  // Programme Radio Maria 2025-2026 basé sur la brochure officielle
  const radioMariaSchedule = [
    { time: "00:00", title: "Chapelet" },
    { time: "00:30", title: "Psaumes" },
    { time: "01:00", title: "Enseignement" },
    { time: "02:00", title: "Formation Humaine" },
    { time: "03:00", title: "Chapelet de la Miséricorde" },
    { time: "03:15", title: "Livre de spiritualité" },
    { time: "03:30", title: "Bible en continu" },
    { time: "04:00", title: "Enseignement" },
    { time: "05:00", title: "Sanctuaires et communautés" },
    { time: "05:30", title: "Chapelet en latin" },
    { time: "06:00", title: "Aube nouvelle" },
    { time: "07:00", title: "Laudes (Famille Missionnaire de Notre Dame)" },
    { time: "07:35", title: "Saints du jour" },
    { time: "07:45", title: "Commentaires des textes de la messe" },
    { time: "08:00", title: "Prières du matin" },
    { time: "08:15", title: "Lecture patristique" },
    { time: "08:30", title: "Chapelet avec un auditeur" },
    { time: "09:10", title: "Formation Humaine" },
    { time: "10:10", title: "Catéchèse du Père Mathieu" },
    { time: "11:10", title: "Office du Milieu du Jour" },
    { time: "11:15", title: "Messe en direct" },
    { time: "11:30", title: "Messe en direct" },
    { time: "12:00", title: "Angelus et Milieu du Jour" },
    { time: "12:10", title: "Psaumes" },
    { time: "12:15", title: "Nouveau Testament" },
    { time: "12:30", title: "Nouveau Testament" },
    { time: "12:45", title: "Open Bible" },
    { time: "13:00", title: "Vatican News" },
    { time: "13:15", title: "Dédicaces / Appel à la conversion" },
    { time: "14:00", title: "Enseignements" },
    { time: "15:00", title: "Chapelet de la Miséricorde" },
    { time: "15:15", title: "Livre de spiritualité" },
    { time: "15:30", title: "Chapelet (Lourdes ou ailleurs)" },
    { time: "16:10", title: "Approfondis ta foi" },
    { time: "17:05", title: "Sanctuaires et communautés / Interview" },
    { time: "17:40", title: "Vêpres" },
    { time: "18:00", title: "Chapelet" },
    { time: "18:45", title: "Psaumes / Spiritualité" },
    { time: "19:00", title: "Messe de ND de Boulogne" },
    { time: "19:40", title: "Pour vous les enfants" },
    { time: "20:00", title: "Catéchèse du Père Mathieu" },
    { time: "21:00", title: "Formation Humaine" },
    { time: "22:00", title: "Complies" },
    { time: "22:20", title: "Appel à la conversion" },
    { time: "23:00", title: "Enseignement" },
  ].sort((a, b) => parseHmToMinutes(a.time) - parseHmToMinutes(b.time));

  function getParisNowMinutes() {
    const parisNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    return parisNow.getHours() * 60 + parisNow.getMinutes();
  }

  function computeCurrentAndNextProgram() {
    const nowM = getParisNowMinutes();
    const dayOfWeek = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' })).getDay(); // 0=dimanche, 1=lundi, etc.

    // Variations selon les jours de la semaine basées sur la brochure officielle
    let schedule = [...radioMariaSchedule];

    // Dimanche : Messe dominicale à 10h00
    if (dayOfWeek === 0) {
      schedule = schedule.map(item => {
        if (item.time === "10:10") return { ...item, title: "Messe dominicale" };
        if (item.time === "12:10") return { ...item, title: "Psaumes" };
        if (item.time === "12:30") return { ...item, title: "Nouveau Testament" };
        if (item.time === "13:00") return { ...item, title: "Formation Humaine" };
        if (item.time === "16:10") return { ...item, title: "Enseignement" };
        if (item.time === "17:05") return { ...item, title: "Poésie religieuse" };
        if (item.time === "18:00") return { ...item, title: "Chapelet et vêpres" };
        if (item.time === "18:45") return { ...item, title: "Enseignement" };
        return item;
      });
    }

    // Mardi : Messe de ND de Pellevoisin à 11h15
    if (dayOfWeek === 2) {
      schedule = schedule.map(item => {
        if (item.time === "11:15") return { ...item, title: "Messe de ND de Pellevoisin" };
        if (item.time === "13:15") return { ...item, title: "Appel à la conversion" };
        return item;
      });
    }

    // Mercredi : Messe de ND du Laus à 11h15
    if (dayOfWeek === 3) {
      schedule = schedule.map(item => {
        if (item.time === "11:15") return { ...item, title: "Messe de ND du Laus" };
        return item;
      });
    }

    // Jeudi : Messe de ND de Grâces (Cotignac) à 11h30
    if (dayOfWeek === 4) {
      schedule = schedule.map(item => {
        if (item.time === "11:30") return { ...item, title: "Messe de ND de Grâces (Cotignac)" };
        return item;
      });
    }

    // Vendredi : Vierge Marie à 10h10
    if (dayOfWeek === 5) {
      schedule = schedule.map(item => {
        if (item.time === "10:10") return { ...item, title: "Vierge Marie" };
        if (item.time === "11:30") return { ...item, title: "Messe de Saint Louis d'Antin" };
        if (item.time === "16:10") return { ...item, title: "Catéchèse de Mgr Macaire" };
        if (item.time === "17:05") return { ...item, title: "Préparons dimanche" };
        if (item.time === "18:45") return { ...item, title: "Enseignement" };
        return item;
      });
    }

    // Samedi : Messe de ND de Boulogne à 19h00
    if (dayOfWeek === 6) {
      schedule = schedule.map(item => {
        if (item.time === "19:00") return { ...item, title: "Messe de ND de Boulogne" };
        return item;
      });
    }

    let currentIdx = -1;
    for (let i = 0; i < schedule.length; i++) {
      const start = parseHmToMinutes(schedule[i].time);
      const next = parseHmToMinutes(schedule[(i + 1) % schedule.length].time);
      if (start <= nowM && (i === schedule.length - 1 ? nowM < 1440 : nowM < next)) {
        currentIdx = i;
        break;
      }
    }
    if (currentIdx === -1) currentIdx = schedule.length - 1; // just before midnight wrap
    const current = schedule[currentIdx];
    const next = schedule[(currentIdx + 1) % schedule.length];
    return { current, next };
  }

  const [{ current: currentRM, next: nextRM }, setRmState] = useState(computeCurrentAndNextProgram());
  useEffect(() => {
    const id = setInterval(() => setRmState(computeCurrentAndNextProgram()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  function playRadioMariaNow() {
    setSelectedRadio(radios[0]);
    if (!showRadio) setShowRadio(true);
    // try to autoplay after load
    setTimeout(() => {
      try {
        if (radioRef.current) {
          radioRef.current.play();
          setRadioPlaying(true);
        }
      } catch { }
    }, 200);
  }

  // Ajoute un nouvel état pour le carousel
  const [showIconCarousel, setShowIconCarousel] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    function handleEscCloseTab(e) {
      if (e.key === 'Escape') {
        window.close();
      }
    }
    window.addEventListener('keydown', handleEscCloseTab);
    return () => window.removeEventListener('keydown', handleEscCloseTab);
  }, []);

  return (
    <div className="flex flex-col font-sans relative" style={{ background: bg, color: text }}>
      {/* Header */}
      <header className="w-full flex items-center justify-center py-4 border-b border-neutral-800 shadow-sm relative z-10" style={{ background: 'rgb(139, 69, 19)' }}>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight" style={{ color: text }}>Prier en ligne</span>
        </div>
      </header>

      {/* Image Christ au centre */}
      {/* <div className="fixed inset-0 flex items-start justify-center z-0 pointer-events-none" style={{ paddingTop: '20vh' }}>
        <div className="relative">
          <Image 
            src="/christ.png" 
            alt="Christ" 
            width={300} 
            height={300} 
            style={{ 
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))',
              maxWidth: '400px',
              maxHeight: '400px',
              objectFit: 'contain'
            }}
            unoptimized
          />
        </div>
      </div> */}

      {/* Overlays */}
      {(lectioOpen || messeOpen || chapeletOpen || horairesOpen || chatOpen || prayerOpen) && (
        <div
          className="fixed inset-0 z-30 transition-opacity duration-300"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => {
            setLectioOpen(false);
            setMesseOpen(false);
            setChapeletOpen(false);
            setHorairesOpen(false);
            setChatOpen(false);
            setPrayerOpen(false);
          }}
        />
      )}

      {/* Volet Chatbot (gauche) */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-[400px] max-w-full shadow-2xl z-[100] transition-transform duration-500 ease-in-out flex flex-col overflow-y-auto
        ${chatOpen ? "translate-x-0" : "-translate-x-full"}
        ${chatExtended ? "w-full max-w-full" : "sm:w-[400px] max-w-full"}`}
        style={{ 
          minWidth: 320, 
          background: panelBg, 
          color: text, 
          width: chatExtended ? '100vw' : undefined, 
          maxWidth: chatExtended ? '100vw' : undefined,
          height: '100dvh',
          maxHeight: '100dvh',
          paddingTop: 'max(0px, env(safe-area-inset-top))',
          paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
          paddingLeft: 'max(0px, env(safe-area-inset-left))',
          paddingRight: 'max(0px, env(safe-area-inset-right))'
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-xl font-bold" style={{ color: text, fontSize: 14 }}>Posez vos questions sur l'Eglise, la foi, le catéchisme</h2>
          <div className="flex gap-2">
            <button
              className="text-xl transition cursor-pointer"
              style={{ color: text, background: "none", border: "none", cursor: 'pointer' }}
              onClick={() => setChatMessages([])}
              aria-label="Effacer l'historique du chat"
              title="Effacer l'historique du chat"
            >
              🗑️
            </button>
            <button
              className="text-xl transition cursor-pointer"
              style={{ color: text, background: "none", border: "none", cursor: 'pointer' }}
              onClick={() => setChatExtended(e => !e)}
              aria-label={chatExtended ? "Réduire" : "Étendre"}
              title={chatExtended ? "Réduire" : "Étendre"}
            >
              {chatExtended ? "🗗" : "🗖"}
            </button>
            <button
              className="text-2xl transition cursor-pointer"
              style={{ color: text, background: "none", border: "none", cursor: 'pointer' }}
              onClick={() => setChatOpen(false)}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(100dvh - 120px - env(safe-area-inset-top) - env(safe-area-inset-bottom))' }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{
              alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
              background: msg.from === "user" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
              color: text,
              borderRadius: 12,
              padding: '12px 16px',
              maxWidth: chatExtended ? '100%' : 380,
              width: chatExtended ? '100%' : undefined,
              marginLeft: msg.from === "user" ? 'auto' : 0,
              marginRight: msg.from === "bot" ? 'auto' : 0,
              fontSize: msg.from === "bot" ? 16 : 15,
              whiteSpace: 'pre-line',
              marginBottom: 0,
              boxShadow: msg.from === "bot" ? '0 2px 8px 0 #0002' : undefined,
            }}>
              {msg.from === "user"
                ? msg.text
                : (msg.text === '...'
                  ? <span style={{ color: '#ffe066', fontWeight: 600, fontSize: 18, background: 'none' }}><AnimatedEllipsis /></span>
                  : <>
                    <span style={{ display: 'block', fontSize: 17, lineHeight: 1.7 }}
                      dangerouslySetInnerHTML={{ __html: msg.citations && msg.citations.length > 0 ? linkifyCitations(msg.text, msg.citations) : marked.parse(msg.text || "") }}
                    />
                    {/* Citations Magisterium intégrées à la suite du texte */}
                    {msg.citations && msg.citations.length > 0 && msg.citations.map((c, j) => (
                      <div key={j} id={`citation-${j + 1}`}
                        style={{
                          marginTop: 10,
                          marginBottom: 0,
                          fontSize: 14,
                          color: '#ffe066',
                          background: 'rgba(255,255,255,0.06)',
                          borderRadius: 10,
                          padding: 12,
                          border: '1px solid #ffe06633',
                          boxShadow: '0 1px 4px 0 #0001',
                          position: 'relative',
                          display: 'block',
                        }}>
                        <div style={{ position: 'absolute', left: 8, top: 8, fontWeight: 700, fontSize: 13, color: '#ffd700cc' }}>#{j + 1}</div>
                        <div style={{ marginLeft: 28 }}>
                          {c.cited_text_heading && <div style={{ fontWeight: 700, marginBottom: 4, color: '#fffbe6' }}>{c.cited_text_heading}</div>}
                          <div style={{ marginBottom: 6 }} dangerouslySetInnerHTML={{ __html: marked.parse(c.cited_text || "") }} />
                          <div style={{ fontStyle: 'italic', color: '#ffe066cc', marginBottom: 2 }}>
                            {c.document_author}{c.document_title ? `, ${c.document_title}` : ''}
                          </div>
                          {c.source_url && <a href={c.source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#ffd700', textDecoration: 'underline', fontSize: 13 }}>Source</a>}
                        </div>
                      </div>
                    ))}
                  </>
                )}
            </div>
          ))}
        </div>
        <form onSubmit={handleSendChat} className="flex gap-2 p-4 border-t border-neutral-700" style={{ background: panelBg }}>
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1 rounded px-3 py-2 outline-none"
            style={{ background: "rgba(255,255,255,0.08)", color: text, border: btnBorder, borderWidth: 1, borderStyle: 'solid' }}
            autoFocus={chatOpen}
          />
          <button
            type="submit"
            className="rounded px-4 py-2 font-semibold"
            style={{ background: btnBg, color: text, border: btnBorder, borderWidth: 1, borderStyle: 'solid' }}
            onMouseOver={e => e.currentTarget.style.background = btnHoverBg}
            onMouseOut={e => e.currentTarget.style.background = btnBg}
          >
            ➤
          </button>
        </form>
      </div>

      {/* Volet Prières (gauche) */}
      <div
        className={`fixed top-0 left-0 w-full sm:w-1/3 max-w-lg shadow-2xl z-[100] transition-transform duration-500 ease-in-out flex flex-col
        ${prayerOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ minWidth: 320, background: panelBg, color: text, height: '100dvh', maxHeight: '100dvh' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-xl font-bold" style={{ color: text, fontSize: 21 }}>Prières</h2>
          <button
            className="text-2xl transition cursor-pointer"
            style={{ color: text, background: "none", border: "none", cursor: 'pointer' }}
            onClick={() => setPrayerOpen(false)}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4 space-y-4">
          {/* Interface de filtres */}
          <div className="sticky top-0 z-10 rounded-lg mb-3 py-2 px-3" style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: 'blur(8px)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-end">
              {/* Filtre par langue */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: text }}>Langue</label>
                <select
                  value={prayerFilter.language}
                  onChange={(e) => setPrayerFilter(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-2 py-1 rounded text-sm"
                  style={{ background: "rgba(255,255,255,0.1)", color: text, border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  {filterOptions.language.map(option => (
                    <option key={option.value} value={option.value} style={{ background: "#8f2727", color: text }}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par catégorie */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: text }}>Catégorie</label>
                <select
                  value={prayerFilter.category}
                  onChange={(e) => setPrayerFilter(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-2 py-1 rounded text-sm"
                  style={{ background: "rgba(255,255,255,0.1)", color: text, border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  {filterOptions.category.map(option => (
                    <option key={option.value} value={option.value} style={{ background: "#8f2727", color: text }}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par saint */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: text }}>Saint</label>
                <select
                  value={prayerFilter.saint}
                  onChange={(e) => setPrayerFilter(prev => ({ ...prev, saint: e.target.value }))}
                  className="w-full px-2 py-1 rounded text-sm"
                  style={{ background: "rgba(255,255,255,0.1)", color: text, border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  {filterOptions.saint.map(option => (
                    <option key={option.value} value={option.value} style={{ background: "#8f2727", color: text }}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par objet */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: text }}>Objet</label>
                <select
                  value={prayerFilter.object}
                  onChange={(e) => setPrayerFilter(prev => ({ ...prev, object: e.target.value }))}
                  className="w-full px-2 py-1 rounded text-sm"
                  style={{ background: "rgba(255,255,255,0.1)", color: text, border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  {filterOptions.object.map(option => (
                    <option key={option.value} value={option.value} style={{ background: "#8f2727", color: text }}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bouton de réinitialisation */}
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setPrayerFilter({ language: 'all', category: 'all', saint: 'all', object: 'all' })}
                className="px-4 py-2 text-sm rounded"
                style={{ background: "rgba(255,255,255,0.1)", color: text, border: "1px solid rgba(255,255,255,0.2)" }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>

          {/* Affichage des prières filtrées */}
          <div className="space-y-4">
            {filteredPrayers.length === 0 ? (
              <div className="text-center py-8" style={{ color: text }}>
                <p className="text-lg">Aucune prière ne correspond aux filtres sélectionnés.</p>
                <p className="text-sm mt-2 opacity-75">Essayez de modifier vos critères de recherche.</p>
              </div>
            ) : (
              filteredPrayers.map((prayer) => (
                <div key={prayer.id} className="p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold" style={{ color: text }}>{prayer.title}</h3>
                    <div className="flex gap-2 text-xs">
                      {prayer.language && (
                        <span className="px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.1)", color: text }}>
                          {prayer.language === 'french' ? '🇫🇷' : prayer.language === 'latin' ? '🏛️' : '🌐'}
                        </span>
                      )}
                      {prayer.saint && (
                        <span className="px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.1)", color: text }}>
                          👤
                        </span>
                      )}
                    </div>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: text,
                      fontStyle: prayer.language === 'latin' ? 'italic' : 'normal'
                    }}
                    dangerouslySetInnerHTML={{ __html: prayer.content }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Volet Lectures du jour (gauche) */}
      <div
        className={`fixed top-0 left-0 w-full sm:w-1/3 max-w-lg shadow-2xl z-[100] transition-transform duration-500 ease-in-out flex flex-col
        ${lectioOpen ? "translate-x-0" : "-translate-x-full"}
        ${lectioExtended ? "w-full max-w-full" : "sm:w-1/3 max-w-lg"}`}
        style={{ minWidth: 320, background: panelBg, color: text, width: lectioExtended ? '100vw' : undefined, maxWidth: lectioExtended ? '100vw' : undefined, height: '100dvh', maxHeight: '100dvh' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-xl font-bold" style={{ color: text, fontSize: 21 }}>Lectio divina</h2>
          <div className="flex gap-2">
            <button
              className="text-xl transition cursor-pointer"
              style={{ color: text, background: "none", border: "none", cursor: 'pointer' }}
              onClick={() => setLectioExtended(e => !e)}
              aria-label={lectioExtended ? "Réduire" : "Étendre"}
              title={lectioExtended ? "Réduire" : "Étendre"}
            >
              {lectioExtended ? "🗗" : "🗖"}
            </button>
            <button
              className="text-2xl transition cursor-pointer"
              style={{ color: text, background: "none", border: "none", cursor: 'pointer' }}
              onClick={() => setLectioOpen(false)}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
          {/* Date et navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div className="font-semibold text-lg">
              {lectioDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex gap-2 mt-1 sm:mt-0">
              <button
                className="px-2 py-1 rounded bg-[#222] border border-neutral-700 text-white hover:bg-neutral-800 transition text-sm"
                style={{ cursor: 'pointer' }}
                onClick={() => setLectioDate(new Date(lectioDate.getTime() - 86400000))}
                aria-label="Jour précédent"
              >◀</button>
              <button
                className="px-2 py-1 rounded bg-[#222] border border-neutral-700 text-white hover:bg-neutral-800 transition text-sm"
                style={{ cursor: 'pointer' }}
                onClick={() => setLectioDate(new Date())}
                aria-label="Aujourd'hui"
                disabled={lectioDate.toDateString() === new Date().toDateString()}
              >Aujourd'hui</button>
              <button
                className="px-2 py-1 rounded bg-[#222] border border-neutral-700 text-white hover:bg-neutral-800 transition text-sm"
                style={{ cursor: 'pointer' }}
                onClick={() => setLectioDate(new Date(lectioDate.getTime() + 86400000))}
                aria-label="Jour suivant"
              >▶</button>
            </div>
          </div>
          {/* Infos liturgiques */}
          {lectioInfo && lectioInfo.length > 0 && (
            <div className="text-yellow-200 text-base space-y-1">
              {lectioInfo.map((line, i) => {
                // If the line matches the saint du jour (heuristic: starts with 'Saint du jour :' or is the only line after ligne1)
                if ((i > 0 && lectioInfo.length > 1 && i === 1) || (lectioInfo.length === 1 && i === 0)) {
                  return (
                    <div key={i}>
                      <span style={{ fontWeight: 'bold', color: '#ffd700' }}>Saint du jour : </span>
                      <span
                        style={{ fontWeight: 'bold', color: '#ffe066', cursor: saintBio ? 'pointer' : 'default', textDecoration: saintBio ? 'underline dotted' : 'none' }}
                        onClick={() => saintBio && setShowSaintPopup(true)}
                        tabIndex={saintBio ? 0 : -1}
                        role={saintBio ? 'button' : undefined}
                        aria-label="Voir la biographie du saint du jour"
                        onKeyDown={e => { if (saintBio && (e.key === 'Enter' || e.key === ' ')) setShowSaintPopup(true); }}
                      >{line}</span>
                    </div>
                  );
                }
                return <div key={i}>{line}</div>;
              })}
            </div>
          )}
          {/* Chargement / erreur */}
          {lectioLoading && <div className="text-center text-neutral-400">Chargement<AnimatedEllipsis /></div>}
          {lectioError && <div className="text-center text-red-400">{lectioError}</div>}
          {/* Lectures */}
          {(!lectioLoading && !lectioError && lectioLectures.length > 0) ? (
            <div className="flex flex-col gap-4" style={{ maxWidth: lectioExtended ? '100%' : 600, width: lectioExtended ? '100%' : undefined }}>
              {lectioLectures.map((lecture, idx) => (
                <div key={idx} className="bg-[#181818] rounded-lg p-3 shadow border border-neutral-800" style={{ width: '100%' }}>
                  <div className="font-bold text-yellow-300 mb-1">
                    {lecture.type === 'lecture_1' ? 'Première lecture' :
                      lecture.type === 'lecture_2' ? 'Deuxième lecture' :
                        lecture.type === 'psaume' ? 'Psaume' :
                          lecture.type === 'evangile' ? 'Évangile' : lecture.type}
                  </div>
                  <div className="text-sm text-yellow-100 mb-1">{lecture.ref}</div>
                  <div className="text-base" style={{ lineHeight: 1.2 }} dangerouslySetInnerHTML={{ __html: (lecture.verset_evangile || lecture.refrain_psalmique || '') + (lecture.contenu || '') }} />
                </div>
              ))}
            </div>
          ) : (!lectioLoading && !lectioError && <div className="text-center text-neutral-400">Aucune lecture trouvée pour ce jour.</div>)}
        </div>
      </div>

      {/* Volet Liturgie de la messe (droite) */}
      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-full shadow-2xl z-[100] transition-transform duration-500 ease-in-out flex flex-col
        ${messeOpen ? "translate-x-0" : "translate-x-full"}
        ${messeExtended ? "w-full max-w-full" : ""}`}
        style={{ minWidth: 320, background: panelBg, color: text, width: messeExtended ? '100vw' : '100vw', maxWidth: messeExtended ? '100vw' : '100vw' }}
      >
        <div className="flex items-center justify-end p-2">
          <button
            className="text-2xl transition cursor-pointer"
            style={{ color: text, background: "none", border: "none", cursor: 'pointer' }}
            onClick={() => setMesseOpen(false)}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        <iframe
          src="/missel-liturgie.pdf"
          style={{ width: '100%', height: '90vh', border: 'none', borderRadius: 8, background: '#fff' }}
          title="Missel PDF"
        />
      </div>

      {/* Volet Chapelet (droite) */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-1/3 max-w-lg shadow-2xl z-[100] transition-transform duration-500 ease-in-out flex flex-col
        ${chapeletOpen ? "translate-x-0" : "translate-x-full"}
        ${chapeletExtended ? "w-full max-w-full" : "sm:w-1/3 max-w-lg"}`}
        style={{ minWidth: 320, background: panelBg, color: text, width: chapeletExtended ? '100vw' : undefined, maxWidth: chapeletExtended ? '100vw' : undefined }}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: text, fontSize: 21 }}>Chapelet</h2>
            <button
              className="text-xl ml-1 transition cursor-pointer"
              style={{ color: '#ffe066', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => setShowChapeletHelp(v => !v)}
              aria-label={showChapeletHelp ? "Masquer le tutoriel" : "Afficher le tutoriel"}
              title={showChapeletHelp ? "Masquer le tutoriel" : "Afficher le tutoriel"}
            >
              ❔
            </button>
          </div>
          <div className="flex gap-2">
            <button
              className="text-xl transition cursor-pointer"
              style={{ color: text, background: "none", border: "none", cursor: 'pointer' }}
              onClick={() => setChapeletExtended(e => !e)}
              aria-label={chapeletExtended ? "Réduire" : "Étendre"}
              title={chapeletExtended ? "Réduire" : "Étendre"}
            >
              {chapeletExtended ? "🗗" : "🗖"}
            </button>
            <button
              className="text-2xl transition cursor-pointer"
              style={{ color: text, background: "none", border: "none", cursor: 'pointer' }}
              onClick={() => setChapeletOpen(false)}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Navigation jour */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="font-semibold text-lg">
              {chapeletDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex gap-2 mt-1 sm:mt-0">
              <button
                className="px-2 py-1 rounded bg-[#222] border border-neutral-700 text-white hover:bg-neutral-800 transition text-sm"
                style={{ cursor: 'pointer' }}
                onClick={() => setChapeletDate(new Date(chapeletDate.getTime() - 86400000))}
                aria-label="Jour précédent"
              >◀</button>
              <button
                className="px-2 py-1 rounded bg-[#222] border border-neutral-700 text-white hover:bg-neutral-800 transition text-sm"
                style={{ cursor: 'pointer' }}
                onClick={() => setChapeletDate(new Date())}
                aria-label="Aujourd'hui"
                disabled={chapeletDate.toDateString() === new Date().toDateString()}
              >Aujourd'hui</button>
              <button
                className="px-2 py-1 rounded bg-[#222] border border-neutral-700 text-white hover:bg-neutral-800 transition text-sm"
                style={{ cursor: 'pointer' }}
                onClick={() => setChapeletDate(new Date(chapeletDate.getTime() + 86400000))}
                aria-label="Jour suivant"
              >▶</button>
            </div>
          </div>
          {mystereChapelet ? (
            <>
              {/* Prières du chapelet */}
              <div className="mt-8" style={{ maxWidth: chapeletExtended ? '100%' : 600, width: chapeletExtended ? '100%' : undefined }}>
                <div className="flex gap-2 mb-4 justify-center">
                  <button
                    className={`px-3 py-1 rounded-full text-sm font-semibold border transition ${prayerLang === 'fr' ? 'bg-yellow-400 text-[#222] border-yellow-400' : 'bg-[#222] text-white border-neutral-700'}`}
                    onClick={() => setPrayerLang('fr')}
                  >Français</button>
                  <button
                    className={`px-3 py-1 rounded-full text-sm font-semibold border transition ${prayerLang === 'la' ? 'bg-yellow-400 text-[#222] border-yellow-400' : 'bg-[#222] text-white border-neutral-700'}`}
                    onClick={() => setPrayerLang('la')}
                  >Latin</button>
                </div>
                <div className="flex flex-col gap-6">
                  {prayers.map((p, i) => (
                    <div key={i} className="bg-[#181818] rounded-lg shadow border border-neutral-800" style={{ width: '100%' }}>
                      <div
                        className="font-bold text-yellow-200 mb-2 cursor-pointer flex items-center gap-2 select-none"
                        style={{ userSelect: 'none' }}
                        onClick={() => togglePrayer(i)}
                        tabIndex={0}
                        aria-expanded={openPrayers[i]}
                        aria-controls={`prayer-content-${i}`}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') togglePrayer(i); }}
                      >
                        <span style={{ fontSize: 18 }}>{openPrayers[i] ? '▼' : '▶'}</span>
                        {p.title}
                      </div>
                      {openPrayers[i] && (
                        <div id={`prayer-content-${i}`} className="text-base" style={{ lineHeight: 1.2, whiteSpace: 'pre-line' }}>{prayerLang === 'fr' ? p.fr : p.la}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Mystères du chapelet */}
              <div className="mt-8 mb-4" style={{ maxWidth: chapeletExtended ? '100%' : 600, width: chapeletExtended ? '100%' : undefined }}>
                <div className="text-lg font-bold text-yellow-300 mb-1 capitalize">Mystères {mystereChapelet.categorie}</div>
                <div className="text-base text-yellow-100 mb-2">{mystereChapelet.description}</div>
                <div className="flex flex-col gap-4">
                  {mystereChapelet.mysteres.map((m, i) => (
                    <div key={i} className="bg-[#181818] rounded-lg p-3 shadow border border-neutral-800" style={{ width: '100%' }}>
                      <div className="font-bold text-yellow-200 mb-1">{i + 1}. {m.nom}</div>
                      <div className="text-sm text-yellow-100 mb-1">Fruit : {m.fruit}</div>
                      <div className="text-sm text-yellow-100 mb-1">{m.citation}</div>
                      <div className="text-base" style={{ lineHeight: 1.2 }}>{m.meditation}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Popup tutoriel chapelet */}
              {showChapeletHelp && (
                <>
                  <div
                    className="fixed inset-0 z-[200] bg-rgb(139, 69, 19) bg-opacity-60 transition-opacity duration-300 flex items-center justify-center"
                    onClick={() => setShowChapeletHelp(false)}
                    aria-label="Fermer la popup tutoriel chapelet"
                  />
                  <div
                    className="fixed left-1/2 top-1/2 z-[201] bg-[#222] text-white rounded-xl shadow-2xl p-6 max-w-[90vw] w-full sm:w-[500px] flex flex-col items-center animate-fadein"
                    style={{ transform: 'translate(-50%, -50%)', marginTop: 32, marginBottom: 32, maxHeight: '80vh', overflowY: 'auto' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <h3 className="text-2xl font-bold mb-3 text-yellow-300">Comment dire le chapelet</h3>
                    <ol className="list-decimal list-inside text-base space-y-1 text-yellow-100 mb-4" style={{ lineHeight: 1.4 }}>
                      <li>Commencez par le Signe de Croix</li>
                      <li>Dites le <b>Je crois en Dieu</b></li>
                      <li>Sur le premier gros grain, dites le <b>Notre Père</b></li>
                      <li>Sur les trois petits grains suivants, dites trois <b>Je vous salue Marie</b></li>
                      <li>Dites le <b>Gloire au Père</b></li>
                      <li>Annoncez le premier mystère, puis dites le <b>Notre Père</b></li>
                      <li>Sur chaque dizaine : dites dix <b>Je vous salue Marie</b> en méditant le mystère</li>
                      <li>Après chaque dizaine, dites le <b>Gloire au Père</b></li>
                      <li>Répétez pour les cinq mystères du jour</li>
                    </ol>
                    <button
                      className="mt-2 px-4 py-2 rounded bg-yellow-400 text-[#222] font-bold shadow hover:bg-yellow-300 transition cursor-pointer"
                      onClick={() => setShowChapeletHelp(false)}
                      autoFocus
                    >
                      Fermer
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center text-neutral-400">Aucun mystère trouvé pour ce jour.</div>
          )}
        </div>
      </div>

      {/* Volet Horaires des messes (gauche) */}
      <div
        className={`fixed top-0 left-0 w-full sm:w-1/3 max-w-lg shadow-2xl z-[100] transition-transform duration-500 ease-in-out flex flex-col
        ${horairesLeftOpen ? "translate-x-0" : "-translate-x-full"}
        ${horairesExtended ? "w-full max-w-full" : "sm:w-1/3 max-w-lg"}`}
        style={{ minWidth: 320, background: panelBg, color: text, width: horairesExtended ? '100vw' : undefined, maxWidth: horairesExtended ? '100vw' : undefined, height: '100dvh', maxHeight: '100dvh' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-xl font-bold" style={{ color: text, fontSize: 21 }}>Horaires des messes</h2>
          <div className="flex gap-2">
            <button
              className="text-xl transition cursor-pointer"
              style={{ color: text, background: "none", border: "none", cursor: 'pointer' }}
              onClick={() => setHorairesExtended(e => !e)}
              aria-label={horairesExtended ? "Réduire" : "Étendre"}
              title={horairesExtended ? "Réduire" : "Étendre"}
            >
              {horairesExtended ? "🗗" : "🗖"}
            </button>
            <button
              className="text-2xl transition cursor-pointer"
              style={{ color: text, background: "none", border: "none", cursor: 'pointer' }}
              onClick={() => setHorairesLeftOpen(false)}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 mx-auto" style={{ maxWidth: horairesExtended ? '100%' : 600, width: horairesExtended ? '100%' : undefined }}>
            <div className="flex items-center gap-2 mb-2 justify-center">
              <button
                className="px-3 py-2 cursor-pointer rounded bg-yellow-400 text-[#222] font-bold shadow hover:bg-yellow-300 transition text-sm"
                onClick={handleGeoLoc}
                disabled={horairesGeoLoading}
              >📍 Avec ma position</button>
              <span>ou</span>
              <div className="relative w-full max-w-[180px]">
                <input
                  ref={horairesInputRef}
                  type="text"
                  className="px-3 py-2 rounded border border-neutral-700 bg-[#222] text-white w-full"
                  placeholder="Ville ou village"
                  value={horairesVille}
                  onChange={e => { setHorairesVille(e.target.value); setHorairesResult(null); setHorairesError(null); }}
                  autoComplete="off"
                  onBlur={handleInputBlur}
                  onFocus={handleInputFocus}
                />
                {horairesSuggestions.length > 0 && horairesVille.length > 1 && (
                  <div
                    className="absolute left-0 right-0 bg-[#222] border border-neutral-700 rounded shadow z-50 mt-1 max-h-40 overflow-y-auto"
                    onMouseEnter={() => setIsSuggestionsHovered(true)}
                    onMouseLeave={() => setIsSuggestionsHovered(false)}
                  >
                    {horairesSuggestions.map((s, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 cursor-pointer hover:bg-yellow-400 hover:text-[#222] transition"
                        onClick={() => { setHorairesVille(s.display_name.split(",")[0]); setHorairesSuggestions([]); fetchHorairesForVille(s.display_name.split(",")[0]); }}
                      >
                        {s.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {horairesLoading && <div className="text-center text-neutral-400">Chargement<AnimatedEllipsis /></div>}
            {horairesError && <div className="text-center text-red-400">{horairesError}</div>}
            {horairesResult && (
              <div
                className="mt-4 text-base"
                style={{ width: '100%', maxHeight: 340, overflowY: 'auto', borderRadius: 8 }}
                tabIndex={0}
                aria-label="Résultats horaires des messes (scrollable)"
                dangerouslySetInnerHTML={{ __html: (horairesResult && typeof horairesResult === 'string' && horairesResult.includes('Messe')) ? generateHorairesHTML(parseHorairesEtLieux(horairesResult)) : horairesResult }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Chat Widget (ouvre le volet) */}
      <div className="fixed top-4 left-4 z-50 cursor-pointer" onClick={() => { closeAllLeftPanels(); setChatOpen(true); }}>
        <button
          className="rounded-full shadow flex items-center justify-center cursor-pointer"
          style={{ width: 32, height: 32, background: btnBg, color: text, border: btnBorder, fontSize: 16, padding: 0, borderWidth: 1, borderStyle: 'solid' }}
          aria-label="Ouvrir le chat"
        >
          💬
        </button>
      </div>

      {/* Contact Link */}
      <a
        href="#"
        className="fixed top-4 right-4 z-50 rounded-full shadow flex items-center justify-center cursor-pointer"
        style={{ width: 32, height: 32, background: btnBg, color: text, border: btnBorder, fontSize: 16, padding: 0, borderWidth: 1, borderStyle: 'solid', textDecoration: 'none' }}
        aria-label="Contact"
        onClick={e => { e.preventDefault(); setShowContactPopup(true); }}
      >
        ❓
      </a>

      {/* Popup Contact */}
      {showContactPopup && (
        <>
          <div
            className="fixed inset-0 z-[200] bg-rgb(139, 69, 19) bg-opacity-60 transition-opacity duration-300 flex items-center justify-center"
            onClick={() => setShowContactPopup(false)}
            aria-label="Fermer la popup de contact"
          />
          <div
            className="fixed left-1/2 top-1/2 z-[201] bg-[#222] text-white rounded-xl shadow-2xl p-6 max-w-[90vw] w-full sm:w-[400px] flex flex-col items-center animate-fadein max-h-[90vh] overflow-y-auto"
            style={{ transform: 'translate(-50%, -50%)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-3">Informations</h3>
            <div className="mb-4 w-full">
              <p className="italic text-yellow-200 text-center">" Prier ne consiste pas à beaucoup penser mais à beaucoup aimer "<br /><span className="text-sm">(sainte Thérèse d'Avila)</span></p>
            </div>
            <div className="mb-4 w-full text-base space-y-1">
              <p>Cette application vous permet de prier avec une bougie virtuelle et d'accéder aux lectures du jour ainsi qu'au chapelet.</p>
              <p>• La bougie peut être allumée pour une durée définie ou indéfinie</p>
              <p>• Les lectures du jour sont mises à jour automatiquement</p>
              <p>• Le chapelet affiche les mystères correspondant au jour de la semaine</p>
            </div>
            <div className="mb-4 w-full flex flex-col items-center">
              <div className="text-lg font-semibold text-yellow-300 select-all">prierenligne@gmail.com</div>
            </div>
            <button
              className="mt-2 px-4 py-2 rounded bg-yellow-400 text-[#222] font-bold shadow hover:bg-yellow-300 transition cursor-pointer"
              onClick={() => setShowContactPopup(false)}
              autoFocus
            >
              Fermer
            </button>
          </div>
          <style>{`
            @keyframes fadein { from { opacity: 0; transform: scale(0.95) translate(-50%, -50%); } to { opacity: 1; transform: scale(1) translate(-50%, -50%); } }
            .animate-fadein { animation: fadein 0.25s; }
          `}</style>
        </>
      )}

      {/* Popup biographie du saint du jour */}
      {showSaintPopup && saintBio && (
        <>
          <div
            className="fixed inset-0 z-[200] bg-rgb(139, 69, 19) bg-opacity-60 transition-opacity duration-300 flex items-center justify-center"
            onClick={() => setShowSaintPopup(false)}
            aria-label="Fermer la popup saint du jour"
          />
          <div
            className="fixed left-1/2 top-1/2 z-[201] bg-[#222] text-white rounded-xl shadow-2xl p-6 max-w-[90vw] w-full sm:w-[500px] flex flex-col items-center animate-fadein"
            style={{ transform: 'translate(-50%, -50%)', marginTop: 32, marginBottom: 32, maxHeight: '80vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-3 text-yellow-300">Saint du jour</h3>
            <div className="mb-4 w-full text-base space-y-1" style={{ color: '#ffe066' }} dangerouslySetInnerHTML={{ __html: saintBio }} />
            <button
              className="mt-2 px-4 py-2 rounded bg-yellow-400 text-[#222] font-bold shadow hover:bg-yellow-300 transition cursor-pointer"
              onClick={() => setShowSaintPopup(false)}
              autoFocus
            >
              Fermer
            </button>
          </div>
        </>
      )}

      {/* Boutons flottants verticaux à gauche */}
      <style>{`
        .vertical-btn-label {
          opacity: 0;
          max-width: 0;
          overflow: hidden;
          transition: opacity 0.2s, max-width 0.2s, margin-left 0.2s;
          margin-left: 0;
          display: inline-block;
          white-space: nowrap;
        }
        .vertical-btn:hover .vertical-btn-label,
        .vertical-btn:focus .vertical-btn-label {
          opacity: 1;
          max-width: 200px;
          margin-left: 8px;
        }
      `}</style>
      <style>{`
        .emoji-btn {
          transition: transform 0.18s cubic-bezier(.4,2,.6,1), filter 0.18s;
          position: relative;
        }
        .emoji-btn:hover, .emoji-btn:focus {
          transform: scale(1.25);
          filter: drop-shadow(0 0 8px #ffe066cc);
        }
        .emoji-tooltip {
          opacity: 1;
          pointer-events: none;
          position: static;
          margin-top: 6px;
          background: rgba(248, 250, 252, 0.9);
          color: #111827;
          padding: 2px 6px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          line-height: 1.2;
          white-space: normal;
          text-align: center;
          word-break: keep-all;
          overflow-wrap: break-word;
          max-width: 100%;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.3);
        }
      `}</style>
      <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-5 z-50 px-2 sm:px-4 place-items-center">
        <button
          className="cursor-pointer emoji-btn"
          style={{ background: '#ffffff', border: '2px solid #ffe066', borderRadius: 24, boxShadow: '0 4px 18px rgba(0,0,0,0.6)', padding: 12, minWidth: 0, fontSize: 56, color: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', width: 120, height: 120 }}
          onClick={() => { closeAllLeftPanels(); setPrayerOpen((open) => !open); }}
        >
          <span>🙏</span>
          <span className="emoji-tooltip">Prières</span>
        </button>
        <button
          className="cursor-pointer emoji-btn"
          style={{ background: '#ffffff', border: '2px solid #ffe066', borderRadius: 24, boxShadow: '0 4px 18px rgba(0,0,0,0.6)', padding: 12, minWidth: 0, fontSize: 56, color: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', width: 120, height: 120 }}
          onClick={() => { closeAllLeftPanels(); setLectioOpen((open) => !open); }}
        >
          <span>📖</span>
          <span className="emoji-tooltip">Lectures du jour</span>
        </button>
        <button
          className="cursor-pointer emoji-btn"
          style={{ background: '#ffffff', border: '2px solid #ffe066', borderRadius: 24, boxShadow: '0 4px 18px rgba(0,0,0,0.6)', padding: 12, minWidth: 0, fontSize: 56, color: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 120, height: 120 }}
          onClick={() => { closeAllRightPanels(); setMesseOpen((open) => !open); }}
        >
          <span>⛪</span>
          <span className="emoji-tooltip">Liturgie</span>
        </button>
        <button
          className="cursor-pointer emoji-btn"
          style={{ background: '#ffffff', border: '2px solid #ffe066', borderRadius: 24, boxShadow: '0 4px 18px rgba(0,0,0,0.6)', padding: 12, minWidth: 0, fontSize: 56, color: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 120, height: 120 }}
          onClick={() => { closeAllRightPanels(); setChapeletOpen(!chapeletOpen); }}
        >
          <span>📿</span>
          <span className="emoji-tooltip">Chapelet</span>
        </button>
        <button
          className="cursor-pointer emoji-btn"
          style={{ background: '#ffffff', border: '2px solid #ffe066', borderRadius: 24, boxShadow: '0 4px 18px rgba(0,0,0,0.6)', padding: 12, minWidth: 0, fontSize: 56, color: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 120, height: 120 }}
          onClick={() => { closeAllLeftPanels(); setHorairesLeftOpen(!horairesLeftOpen); }}
        >
          <span>🕐</span>
          <span className="emoji-tooltip">Horaires des messes</span>
        </button>
        <button
          className="cursor-pointer emoji-btn"
          style={{ background: '#ffffff', border: '2px solid #ffe066', borderRadius: 24, boxShadow: '0 4px 18px rgba(0,0,0,0.6)', padding: 12, minWidth: 0, fontSize: 56, color: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 120, height: 120 }}
          onClick={() => { closeAllRightPanels(); setBibleOpen(!bibleOpen); }}
        >
          <span>✝️</span>
          <span className="emoji-tooltip">Bible</span>
        </button>
        {/* Ajoute ici le sélecteur d'icônes en colonne */}
        <button
          key={icons[0].label}
          className="cursor-pointer"
          style={{ background: '#ffffff', border: '2px solid #ffe066', borderRadius: 24, boxShadow: '0 4px 18px rgba(0,0,0,0.6)', padding: 12, minWidth: 0, fontSize: 56, color: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 120, height: 120 }}
          onClick={() => { setCarouselIndex(0); setShowIconCarousel(true); }}
          aria-label={icons[0].label}
        >
          <Image src={icons[0].src} alt={icons[0].label} width={50} height={50} unoptimized />
          <span className="emoji-tooltip">Icônes</span>
        </button>
      </div>
      {/* Affichage de l'icône sélectionnée au centre de la page */}
      {selectedIcon && (
        <div className="fixed left-1/2 z-40 flex flex-col items-center" style={{ top: '35%', transform: 'translate(-50%, -50%)' }}>
          <Image src={selectedIcon} alt="Icône sélectionnée" width={200} height={200} style={{ borderRadius: '16px', boxShadow: '0 4px 32px #000a', background: '#222' }} unoptimized />
        </div>
      )}
      {/* Icône de prière centrée en bas, timer à droite */}
      {/* <div className="fixed left-1/2 bottom-4 sm:bottom-12 z-50" style={{ transform: 'translateX(-50%)' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Image
            src="https://images.emojiterra.com/google/noto-emoji/unicode-15/color/512px/1f64f.png"
            alt="Icône de prière"
            width={64}
            height={64}
            style={{ filter: candleLit ? 'brightness(0.7)' : 'none', transition: 'filter 0.2s', cursor: 'pointer' }}
            onClick={() => setShowIconCarousel(true)}
            unoptimized
          />
        </div>
      </div>
      <Candle /> */}
      {/* Popin sélecteur de temps de prière */}
      {showDurationSelector && (
        <>
          <div
            className="fixed inset-0 z-[200] bg-rgb(139, 69, 19) bg-opacity-60 transition-opacity duration-300 flex items-center justify-center"
            onClick={() => setShowDurationSelector(false)}
            aria-label="Fermer la sélection du temps de prière"
          />
          <div
            className="fixed left-1/2 top-1/2 z-[201] bg-[#222] text-white rounded-xl shadow-2xl p-6 max-w-[90vw] w-full sm:w-[340px] flex flex-col items-center animate-fadein"
            style={{ transform: 'translate(-50%, -50%)', marginTop: 32, marginBottom: 32 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-3 text-yellow-300">Choisir le temps de prière</h3>
            <div className="flex gap-2 mb-4 justify-center">
              {durations.map((d) => (
                <button
                  key={d.label}
                  className={`rounded border px-3 py-1 text-sm font-medium transition cursor-pointer ${selectedDuration === d.value ? 'border-yellow-400 bg-[#222] text-yellow-200' : 'border-neutral-700 bg-[#181818] text-neutral-300'}`}
                  style={{ minWidth: 48, height: 32, lineHeight: '28px', boxShadow: 'none' }}
                  onClick={() => {
                    setSelectedDuration(d.value);
                    setCustomDuration('');
                    setShowDurationSelector(false);
                    setCandleLit(true); // Allume la bougie
                  }}
                  aria-label={d.label}
                >
                  {d.label}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={1440}
                step={1}
                value={customDuration}
                onChange={e => {
                  const val = e.target.value;
                  setCustomDuration(val);
                  const min = parseInt(val, 10);
                  if (!isNaN(min) && min > 0) {
                    setSelectedDuration(min * 60);
                  }
                }}
                placeholder="min"
                className="px-2 py-1 rounded border border-neutral-700 bg-[#181818] text-sm text-yellow-200 w-16 outline-none"
                style={{ height: 32, lineHeight: '28px' }}
                aria-label="Durée personnalisée en minutes"
                onFocus={e => e.stopPropagation()}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
          <style>{`
            @keyframes fadein { from { opacity: 0; transform: scale(0.95) translate(-50%, -50%); } to { opacity: 1; transform: scale(1) translate(-50%, -50%); } }
            .animate-fadein { animation: fadein 0.25s; }
          `}</style>
        </>
      )}
      {/* Volet Bible (droite) */}
      <div
        className={`fixed top-0 right-0 w-full sm:w-1/3 max-w-lg shadow-2xl z-[100] transition-transform duration-500 ease-in-out flex flex-col
        ${bibleOpen ? "translate-x-0" : "translate-x-full"}
        ${bibleExtended ? "w-full max-w-full" : "sm:w-1/3 max-w-lg"}`}
        style={{ minWidth: 320, background: panelBg, color: text, width: bibleExtended ? '100vw' : undefined, maxWidth: bibleExtended ? '100vw' : undefined, height: '100dvh', maxHeight: '100dvh' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-xl font-bold" style={{ color: text, fontSize: 21 }}>Bible</h2>
          <div className="flex gap-2">
            <button
              className="text-xl transition cursor-pointer"
              style={{ color: text, background: "none", border: "none", cursor: 'pointer' }}
              onClick={() => setBibleExtended(e => !e)}
              aria-label={bibleExtended ? "Réduire" : "Étendre"}
              title={bibleExtended ? "Réduire" : "Étendre"}
            >
              {bibleExtended ? "🗗" : "🗖"}
            </button>
            <button
              className="text-2xl transition cursor-pointer"
              style={{ color: text, background: "none", border: "none", cursor: 'pointer' }}
              onClick={() => setBibleOpen(false)}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 flex-1 overflow-y-auto" style={{ position: 'relative' }}>
          {/* Overlay de chargement Bible */}
          {bibleLoading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}>
              <div className="animate-spin" style={{ width: 48, height: 48, border: '5px solid #ffe066', borderTop: '5px solid transparent', borderRadius: '50%' }} />
            </div>
          )}
          {/* Affichage navigation ou texte biblique */}
          {bibleContent == null ? (
            <div className="flex flex-col gap-6" style={bibleLoading ? { filter: 'blur(1px)', pointerEvents: 'none', userSelect: 'none' } : {}}>
              {/* Ancien Testament */}
              <div>
                <div className="text-lg font-bold text-yellow-300 mb-2">Ancien Testament</div>
                <div className="flex flex-col gap-1">
                  {bibleBooks["Ancien Testament"].map((book, idx) => (
                    <div
                      key={book + idx}
                      className="text-base text-yellow-100 hover:text-yellow-300 cursor-pointer"
                      style={{ paddingLeft: 8 }}
                      onClick={() => handleClickBibleBook(book)}
                    >
                      {book}
                    </div>
                  ))}
                </div>
              </div>
              {/* Nouveau Testament */}
              <div>
                <div className="text-lg font-bold text-yellow-300 mb-2">Nouveau Testament</div>
                <div className="flex flex-col gap-1">
                  {bibleBooks["Nouveau Testament"].map((book, idx) => (
                    <div key={book + idx} className="text-base text-yellow-100 hover:text-yellow-300 cursor-pointer" style={{ paddingLeft: 8 }}>{book}</div>
                  ))}
                </div>
              </div>
              {/* Psaumes */}
              <div>
                <div className="text-lg font-bold text-yellow-300 mb-2">Psaumes</div>
                <div className="flex flex-wrap gap-2">
                  {bibleBooks["Psaumes"].map((psaume, idx) => (
                    <div key={"psaume-" + psaume} className="text-base text-yellow-100 hover:text-yellow-300 cursor-pointer border border-yellow-300 rounded px-2 py-1" style={{ minWidth: 36, textAlign: 'center' }}>{psaume}</div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4" style={bibleLoading ? { filter: 'blur(1px)', pointerEvents: 'none', userSelect: 'none' } : {}}>
              {/* Sélecteur de chapitre si livre courant connu */}
              {bibleCurrentBook && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-yellow-200 text-base">{bibleCurrentBook.name}</span>
                  <span className="text-yellow-100">Chapitre</span>
                  <select
                    className="rounded border border-yellow-300 bg-[#181818] text-yellow-200 px-2 py-1 text-base outline-none"
                    value={bibleCurrentChapitre}
                    onChange={e => {
                      const chap = parseInt(e.target.value, 10);
                      setBibleCurrentChapitre(chap);
                      fetchBibleText(bibleCurrentBook.code, chap);
                    }}
                    style={{ minWidth: 60 }}
                  >
                    {Array.from({ length: bibleMaxChapitre }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              )}
              <button
                className="self-start mb-2 px-3 py-1 rounded bg-yellow-400 text-[#222] font-semibold shadow hover:bg-yellow-300 transition text-sm"
                onClick={() => {
                  setBibleContent(null);
                  setBibleError(null);
                  setBibleCurrentBook(null);
                  setBibleCurrentChapitre(1);
                  setBibleMaxChapitre(1);
                }}
                aria-label="Retour à la navigation de la Bible"
              >
                ← Retour
              </button>
              {bibleError && <div className="text-center text-red-400">{bibleError}</div>}
              {bibleContent && (
                <div className="bg-[#181818] rounded-lg p-4 shadow border border-neutral-800 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: bibleContent }} />
              )}
            </div>
          )}
        </div>
      </div>
      {/* Encart Radio Maria en direct */}
      {/* <div className="fixed top-14 left-4 right-4 sm:top-auto sm:bottom-[92px] sm:left-auto sm:right-4 z-[55]">
        <div className="rounded-xl shadow-2xl p-3 flex items-center gap-2"
          style={{ background: "#1f1f1f", color: text, border: "1px solid rgba(255,255,255,0.12)", maxWidth: 340 }}>
          <div className="flex flex-col">
            <div className="text-xs uppercase tracking-wide" style={{ color: '#ffeb99' }}>En direct · Radio Maria</div>
            <div className="text-sm font-semibold" style={{ color: '#fff' }}>{currentRM?.title || 'Programme en cours'}</div>
            {nextRM && (
              <div className="text-[10px] sm:text-xs opacity-70 sm:opacity-80 hidden sm:block" style={{ color: '#ddd' }}>Ensuite {nextRM.time} · {nextRM.title}</div>
            )}
          </div>
          <button
            onClick={playRadioMariaNow}
            className="ml-auto px-2 py-1.5 sm:px-3 sm:py-2 rounded font-bold text-[10px] sm:text-sm flex-shrink-0"
            style={{ background: '#ffe066', color: '#222', border: 'none', boxShadow: '0 1px 4px #0004', cursor: 'pointer' }}
            aria-label="Lancer Radio Maria"
            title="Écouter Radio Maria maintenant"
          >
            <span className="hidden sm:inline">▶ Écouter</span>
            <span className="sm:hidden">▶</span>
          </button>
        </div>
      </div> */}

      {/* Bouton Radio Maria */}
      <style>{`
        @keyframes shake-radio {
          0% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-12deg) scale(1.08); }
          40% { transform: rotate(10deg) scale(1.12); }
          60% { transform: rotate(-8deg) scale(1.08); }
          80% { transform: rotate(8deg) scale(1.04); }
          100% { transform: rotate(0deg) scale(1); }
        }
        .radio-shake:hover, .radio-shake:focus {
          animation: shake-radio 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
      <div className="fixed bottom-4 right-4 z-[50] flex flex-col items-end">
        <button
          className="rounded-full shadow flex items-center justify-center cursor-pointer bg-yellow-400 hover:bg-yellow-300 transition radio-shake"
          style={{ width: 56, height: 56, fontSize: 30, color: '#222', border: 'none', boxShadow: '0 2px 12px #0004', marginBottom: showRadio ? 12 : 0 }}
          aria-label={showRadio ? "Fermer la radio" : "Écouter la radio"}
          title={showRadio ? "Fermer la radio" : "Écouter la radio"}
          onClick={toggleRadio}
        >
          <span role="img" aria-label="Radio">📻</span>
        </button>
        {showRadio && (
          <div className="bg-[#222] text-white rounded-xl shadow-2xl p-4 flex flex-col items-center animate-fadein" style={{ minWidth: 220, maxWidth: 320, marginBottom: 8 }}>
            <div className="flex gap-2 mb-2">
              {radios.map(radio => (
                <button
                  key={radio.name}
                  className={`px-3 py-1 rounded font-bold text-sm transition ${selectedRadio.name === radio.name ? 'bg-yellow-400 text-[#222]' : 'bg-[#181818] text-yellow-200 border border-yellow-400'}`}
                  style={{ outline: 'none', borderWidth: 1, borderStyle: 'solid' }}
                  onClick={() => setSelectedRadio(radio)}
                  aria-label={`Écouter ${radio.name}`}
                >
                  {radio.name}
                </button>
              ))}
            </div>
            <audio ref={radioRef} src={selectedRadio.url} controls style={{ width: '100%' }} onPlay={() => setRadioPlaying(true)} onPause={() => setRadioPlaying(false)} />
          </div>
        )}
      </div>
      {showIconCarousel && (
        <div className="fixed inset-0 z-[200] bg-rgb(139, 69, 19) bg-opacity-70 flex items-center justify-center" onClick={() => setShowIconCarousel(false)}>
          <div className="relative bg-[#222] rounded-xl shadow-2xl p-6 flex flex-col items-center" style={{ minWidth: 320, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setCarouselIndex((carouselIndex - 1 + icons.length) % icons.length)}
                style={{ fontSize: 32, background: 'none', border: 'none', color: '#ffe066', cursor: 'pointer' }}
                aria-label="Précédent"
              >
                ‹
              </button>
              <div className="flex flex-col items-center">
                <Image src={icons[carouselIndex].src} alt={icons[carouselIndex].label} width={160} height={160} style={{ borderRadius: 24, boxShadow: '0 4px 32px #000a', background: '#222' }} unoptimized />
                <div className="mt-2 text-yellow-200 font-semibold text-lg text-center">{icons[carouselIndex].label}</div>
              </div>
              <button
                onClick={() => setCarouselIndex((carouselIndex + 1) % icons.length)}
                style={{ fontSize: 32, background: 'none', border: 'none', color: '#ffe066', cursor: 'pointer' }}
                aria-label="Suivant"
              >
                ›
              </button>
            </div>
            <button
              className="mt-6 px-6 py-2 rounded bg-yellow-400 text-[#222] font-bold shadow hover:bg-yellow-300 transition cursor-pointer"
              onClick={() => { 
                setSelectedIcon(icons[carouselIndex].src); 
                setShowIconCarousel(false);
                setShowDurationSelector(true);
              }}
              style={{ fontSize: 18 }}
            >
              Choisir cette icône
            </button>
            <button
              className="mt-2 px-4 py-1 rounded bg-neutral-700 text-yellow-200 font-medium hover:bg-neutral-600 transition cursor-pointer"
              onClick={() => setShowIconCarousel(false)}
              style={{ fontSize: 15 }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
