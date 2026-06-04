# Origin Verfügbarkeits-Checker

Web-App zur Prüfung der Verfügbarkeit von Videoinhalten über die drei ARD-MCDN
Origin-Umgebungen **Dev / Stage / Prod**.

## Varianten

| Branch / Datei | Beschreibung |
| --- | --- |
| `main` | Node/Express-Server (empfohlen für zuverlässige HTTP-Checks) |
| `standalone` | Eine HTML-Datei, ohne Installation – Doppelklick genügt |

Aus einer TV-ID werden per Regex die URLs für alle drei Auslieferungsformate abgeleitet:

| Format | Beschreibung | Endung |
| --- | --- | --- |
| Progressive Media Download | Direkter Download | `*.mp4` |
| Adaptive Media (HLS) | HTTP Live Streaming | `*.m3u8` |
| Adaptive Media (DASH) | MPEG-DASH | `*.mpd` |

Für jede Kombination aus Umgebung und Format wird die Verfügbarkeit angezeigt
(grüner Haken ✓ / rotes Kreuz ✕) und es steht ein Play-Button bereit.

## Warum ein Backend?

Die Verfügbarkeits-Prüfungen laufen **serverseitig** (Node/Express). Würde der
Browser die Origins direkt abfragen, würden die Anfragen i. d. R. an CORS
scheitern. Das Backend führt einen `HEAD`-Request aus (mit `GET`-Range-Fallback)
und meldet das Ergebnis an das Frontend.

## Start

```bash
npm install
npm start
```

Danach im Browser öffnen: <http://localhost:3000>

Mit Auto-Reload während der Entwicklung:

```bash
npm run dev
```

Port anpassen: `PORT=8080 npm start`
Timeout der Checks (ms): `CHECK_TIMEOUT_MS=5000 npm start`

## TV-ID & Pfad-Ableitung

Erkanntes Muster: `TV-YYYYMMDD-HHMM-NNNN` (optionale Qualität/Endung wird ignoriert).

Beispiel-ID: `TV-20260522-1800-5711.hq.mp4`

Daraus gebildete URLs (Beispiel Dev):

```
MP4:  https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-dev.de/ndr/2026/0522/TV-20260522-1800-5711.hd.mp4
HLS:  https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-dev.de/i/ndr/2026/0522/TV-20260522-1800-5711.,hd,hq,.mp4.csmil/master.m3u8
DASH: https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-dev.de/i/ndr/2026/0522/TV-20260522-1800-5711.,hd,hq,.mp4.csmil/dash.mpd
```

### Origin-Umgebungen

| Umgebung | URL |
| --- | --- |
| Dev | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-dev.de` |
| Stage | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-qs.de` |
| Prod | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn.de` |

### Erweiterte Optionen (im UI einklappbar)

- **Progressive Qualität** – Qualitäts-Tag für den MP4-Download (Default `hd`).
- **Adaptive Renditions** – Komma-Liste der Renditions für den `*.csmil`-Pfad
  (Default `hd,hq`, z. B. auch `ln,1080,hd,hq,mn`).
- **Sender** – Pfadsegment des Senders (Default `ndr`).

## Wiedergabe / Player

- **MP4** – natives `<video>`-Element.
- **HLS** – [hls.js](https://github.com/video-dev/hls.js) (Safari nutzt nativen HLS-Support).
- **DASH** – [dash.js](https://github.com/Dash-Industry-Forum/dash.js).

Hinweis: Die Wiedergabe erfolgt direkt im Browser gegen die Origin. Liefert die
Origin keine CORS-Header für die Mediensegmente, kann die Wiedergabe trotz
vorhandener Datei scheitern. In dem Fall stehen „In neuem Tab öffnen" und
„URL kopieren" als Alternative bereit.

## Projektstruktur

```
.
├── server.js          # Express-Server + /api/check
├── lib/paths.js       # Regex-/URL-Ableitung, Umgebungen, Formate
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js         # Suche, Matrix-Rendering, Player
├── package.json
└── README.md
```
