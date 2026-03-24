

# Filmsuggestiepage

## Studentgegevens
- **Naam:** Caio
- **Vak:** Web Topics
- **Project:** Filmsuggestiepage

---

## Projectbeschrijving

Filmsuggestiepage is een interactieve fullstack webapplicatie rond films.  
De website combineert een moderne frontend met een Node.js backend en gebruikt verschillende web topics uit de cursus, zoals Web Components, d3.js, WebSockets, p5.js, GSAP, Wikidata/SPARQL, RSS, Web Workers, PWA en Webmentions.

Het doel van het project is om films op een aantrekkelijke en interactieve manier te tonen, extra informatie op te halen, gebruikers comments te laten plaatsen en live communicatie toe te voegen via WebSockets.

---

## Live links

- **Frontend:** `https://film-suggestie-page.onrender.com/`
- **Backend:** `https://filmsuggestiepage.onrender.com`
- **RSS-feed:** `https://filmsuggestiepage.onrender.com/rss.xml`

---

## Repository-structuur

Het project is opgezet als een **monorepo** met twee delen:

### Frontend

De frontend bevat:

- de Vite-app
- de gebruikersinterface
- de componenten
- styling
- animaties
- quizlogica
- PWA-bestanden
- communicatie met de backend

### Backend

De backend bevat:

- de Express-server
- API-routes
- WebSocket-functionaliteit
- JSON-opslag
- RSS-feed
- Wikidata-verrijking
- webmentions

## Functionaliteiten van de website

De website bevat onder andere de volgende functionaliteiten:

- films bekijken in een visuele interface
- filmdata ophalen en tonen
- een filmcarousel bovenaan de pagina
- comments plaatsen onder films
- live comments/chat via WebSockets
- filmquiz
- RSS-feed
- PWA-functionaliteit
- verrijking van filmdata via Wikidata/SPARQL
- animaties bij scrollen
- accessibility testing

---

# Algemene werking van de site

## 1. Opstart van de applicatie

Wanneer de gebruiker de website opent, start de frontend op via `main.js`.  
Daar worden de verschillende onderdelen van de site geïnitialiseerd:

- filmdata laden
- filmarchief tonen
- quiz voorbereiden
- animaties activeren
- componenten opbouwen

## 2. Ophalen van data

De frontend haalt data op via de backend.  
De backend levert filminformatie, comments en andere data via API-routes.

## 3. Weergave van films

De films worden visueel getoond in verschillende vormen:

- filmkaarten
- archiefweergave
- carousel
- detailweergave
- quiz

## 4. Comments en live communicatie

Gebruikers kunnen comments plaatsen onder films.  
Een nieuwe comment wordt:

- opgeslagen via een API-call naar de backend
- live doorgestuurd naar andere gebruikers via WebSockets

Daardoor verschijnt de nieuwe comment meteen op andere open clients zonder refresh.

## 5. Verrijking van filminformatie

De backend kan films verrijken met extra informatie via Wikidata/SPARQL.  
Daardoor wordt de filmdata uitgebreider en informatiever.

## 6. Extra webfunctionaliteit

Naast de kernfunctionaliteit bevat de site ook:

- RSS
- webmentions
- PWA
- Web Worker
- animaties
- accessibility controle

---

# Gebruikte web topics

## 1. Web Components

### Wat is het?

Web Components laten toe om herbruikbare HTML-elementen te maken met eigen gedrag, structuur en logica.

### Hoe gebruikt in dit project?

De frontend is opgebouwd uit custom elements zoals:

- `app-button`
- `film-card`
- `film-carousel`
- `film-comments`
- `film-quiz`

Elke component heeft zijn eigen verantwoordelijkheid en maakt de interface modulair.

### Waarom gebruikt?

Web Components zorgen voor:

- een duidelijke structuur
- herbruikbare code
- betere scheiding tussen onderdelen
- onderhoudbare frontendcode

### Resultaat

De website is opgebouwd uit losse, herbruikbare onderdelen in plaats van één grote onoverzichtelijke codebasis.

---

## 2. WebSockets

### Wat is het?

WebSockets maken een live tweerichtingsverbinding mogelijk tussen client en server.

### Hoe gebruikt in dit project?

WebSockets worden gebruikt voor de live comments onder films.

Per film wordt een aparte chatroom gebruikt op basis van een unieke film-ID (`qid`).  
Wanneer een gebruiker een comment plaatst:

- wordt de comment opgeslagen via de backend API
- wordt die onmiddellijk via WebSocket doorgestuurd naar andere actieve clients

### Waarom gebruikt?

Met gewone API-calls zou de gebruiker moeten refreshen om nieuwe comments te zien.  
Met WebSockets kunnen updates onmiddellijk live verschijnen.

### Resultaat

Wanneer een gebruiker een comment plaatst, zien andere gebruikers of andere open tabbladen deze meteen verschijnen zonder refresh.

---

## 3. p5.js

### Wat is het?

p5.js is een JavaScript-library voor interactieve visualisaties en canvasanimaties.

### Hoe gebruikt in dit project?

p5.js wordt gebruikt voor de hero/carousel bovenaan de website.  
Daarmee wordt een visuele, dynamische filmweergave gemaakt.

### Waarom gebruikt?

De library maakt het makkelijker om interactieve graphics en animaties op canvas te bouwen.

### Resultaat

De homepage krijgt een levendige en visueel aantrekkelijkere intro, waardoor de site meteen dynamischer aanvoelt.

---

## 4. GSAP + ScrollTrigger

### Wat is het?

GSAP is een krachtige animatielibrary.  
ScrollTrigger is een plugin waarmee animaties gekoppeld worden aan scrollgedrag.

### Hoe gebruikt in dit project?

GSAP en ScrollTrigger worden gebruikt om:

- secties mooi in beeld te laten komen
- elementen te animeren tijdens het scrollen
- de pagina vloeiender en dynamischer te maken

### Waarom gebruikt?

Om de gebruikerservaring visueel sterker te maken en de site moderner te laten aanvoelen.

### Resultaat

De website bevat vloeiende scrollanimaties die content op een aantrekkelijke manier in beeld brengen.

---

## 5. Wikidata / SPARQL

### Wat is het?

Wikidata is een open kennisbank met gestructureerde data.  
SPARQL is de querytaal waarmee die gegevens opgevraagd kunnen worden.

### Hoe gebruikt in dit project?

De backend gebruikt Wikidata/SPARQL om extra filminformatie op te halen en bestaande filmdata te verrijken.

### Waarom gebruikt?

De basisfilmdata is beperkt.  
Via Wikidata kan extra informatie toegevoegd worden, waardoor films rijker beschreven worden.

### Resultaat

De website kan uitgebreidere filmdetails tonen dan wanneer enkel lokale data gebruikt zou worden.

---

## 6. RSS

### Wat is het?

RSS is een XML-formaat waarmee inhoud in een gestandaardiseerde feed aangeboden kan worden.

### Hoe gebruikt in dit project?

De backend genereert een RSS-feed op basis van de filmdata van de website.

### Correcte RSS-link

`https://filmsuggestiepage.onrender.com/rss.xml`

### Waarom gebruikt?

Dit toont dat de website informatie niet alleen visueel toont, maar ook semantisch en machine-readable kan aanbieden.

### Resultaat

De site heeft een werkende RSS-feed die extern gelezen of geabonneerd kan worden.

---

## 7. Webmentions

### Wat is het?

Webmentions zijn een open webstandaard waarmee websites naar elkaar kunnen verwijzen of interacties kunnen uitwisselen.

### Hoe gebruikt in dit project?

De backend bevat een route en opslagstructuur voor webmentions.

### Waarom gebruikt?

Om te tonen dat de site ook rekening houdt met open web-standaarden en communicatie tussen websites.

### Resultaat

De website bevat ondersteuning voor webmentions als extra webtopic naast de klassieke frontend/backendfunctionaliteit.

---

## 8. Web Workers

### Wat is het?

Een Web Worker laat JavaScript-code op een aparte thread draaien, los van de hoofdthread van de browser.

### Hoe gebruikt in dit project?

De quizverwerking gebeurt via een Web Worker.

### Waarom gebruikt?

Wanneer logica of berekeningen in de hoofdthread gebeuren, kan de interface vertragen of blokkeren.  
Met een Web Worker blijft de UI responsief.

### Resultaat

De quiz kan verwerkt worden zonder dat de rest van de website stroef aanvoelt.

---

## 9. PWA (Progressive Web App)

### Wat is het?

Een PWA maakt van een website een app-achtige ervaring met onder andere caching, manifest en service worker.

### Hoe gebruikt in dit project?

De frontend bevat:

- een `manifest.json`
- een `service-worker.js`

### Waarom gebruikt?

Om de site moderner te maken en eigenschappen van een webapp toe te voegen, zoals caching en snellere herlaadtijden.

### Resultaat

De site ondersteunt PWA-principes en gedraagt zich meer als een moderne webapplicatie.

---

## 10. d3.js

### Wat is het?

d3.js is een JavaScript-library om data visueel voor te stellen en dynamische datavisualisaties te maken.

### Hoe gebruikt in dit project?

d3.js wordt gebruikt om gegevens visueel weer te geven, bijvoorbeeld in grafische of samenvattende vorm binnen de filmsite.

### Waarom gebruikt?

Omdat d3.js geschikt is om data niet alleen tekstueel, maar ook visueel en interactief te tonen.

### Resultaat

De website bevat een extra datavisualisatie-aspect dat de inhoud informatiever en visueel rijker maakt.

---

# Werking van de comments

Het commentsysteem bestaat uit twee delen:

## 1. Opslag via backend API

Wanneer een gebruiker een comment plaatst:

- stuurt de frontend een POST-request naar de backend
- de backend slaat de comment op per film

## 2. Live update via WebSocket

Na het opslaan wordt dezelfde comment live gebroadcast naar andere clients.

### Waarom deze combinatie?

- de API zorgt voor opslag
- de WebSocket zorgt voor live communicatie

### Resultaat

De gebruiker krijgt zowel persistente comments als live interactie.

---

# Werking van de quiz

De quiz is een apart onderdeel van de website waarmee gebruikers filminhoud interactief kunnen verkennen.

De quiz:

- toont vragen
- verwerkt antwoorden
- werkt met score/resultaten
- gebruikt een Web Worker voor performantie

Daardoor toont het project niet alleen informatie, maar ook actieve gebruikersinteractie.

---

# Werking van de filmcarousel

De carousel bovenaan de site is een visueel element gebouwd met p5.js.

De carousel:

- toont films in een dynamische hero
- zorgt voor een sterke eerste indruk
- verhoogt de visuele aantrekkelijkheid van de homepage

Voor mobiel gebruik werd de carousel aangepast zodat touch-scroll van de pagina correct blijft werken.

---

# Deployment

Het project is gedeployed op Render.

## Frontend

- gedeployed als Static Site
- root directory: `front`

## Backend

- gedeployed als Web Service
- root directory: `back`

### Waarom deze opsplitsing?

De frontend en backend hebben een verschillende rol:

- frontend = client-side interface
- backend = server-side logica, API, WebSockets, RSS, webmentions

Deze architectuur past goed bij een moderne fullstack applicatie.

---

# Lokale installatie

## Frontend starten

Ga naar de `front` map en voer uit:

```bash
npm install
npm run dev