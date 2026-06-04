# S3-Origin Verfügbarkeitscheck · Version 1.1

Prüfung der Verfügbarkeit von Videoinhalten auf den ARD-MCDN S3-Origin-Umgebungen
**(Dev / Stage / Prod)**.

Repository: <https://github.com/lentzh/Origin-Test>

## Standalone (empfohlen)

Datei **`origin-availability-checker.html`** im Projektroot öffnen (Doppelklick oder „Öffnen mit“ im Browser). Kein `npm install`, kein Server nötig.

| Funktion | Beschreibung |
| --- | --- |
| TV-ID | Reine Basis-ID `TV-YYYYMMDD-HHMM-NNNN`; alle Qualitäts-Suffixe werden automatisch geprüft |
| Renditions | LRA NDR: 21 Formate aus `renditions.xlsx` (weitere LRAs vorbereitet) |
| Formate | MP4 (progressiv), HLS (M3U8), DASH (MPD) |
| Umgebungen | Dev / Stage / Prod per Tab |
| Übersicht | Kompakte Matrix mit ✓ / ✕ |
| Player | Separater Bereich mit Ausspielpfad, Abspielen, Neu Laden |

Revisionshistorie: **[REVISIONS.md](REVISIONS.md)** (V1.0 + V1.1). Katalog aktualisieren:

```bash
python3 tools/import-renditions.py
```

## Node/Express-Variante (älterer Stand)

Optional für serverseitige HTTP-Checks ohne Browser-CORS:

```bash
npm install
npm start
```

→ <http://localhost:3000> (Frontend unter `public/` – funktional älter als die Standalone V1.0)

## Origin-Umgebungen

| Umgebung | URL |
| --- | --- |
| Dev | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-dev.de` |
| Stage | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-qs.de` |
| Prod | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn.de` |

## Branches

| Branch | Inhalt |
| --- | --- |
| `main` | Standalone HTML + REVISIONS.md + Node-Variante |
| `standalone` | Entwicklungszweig der Standalone-Version (mit `main` synchron) |

## Projektstruktur

```
.
├── origin-availability-checker.html   # S3-Origin Verfügbarkeitscheck 1.1 (Standalone)
├── renditions.xlsx                    # Renditions-Master LRA NDR
├── lib/renditions-catalog.json        # Generierter Katalog (pro LRA)
├── tools/import-renditions.py         # Excel → JSON + HTML einbetten
├── REVISIONS.md                       # Revisionshistorie
├── server.js                          # Express-Server (ältere Variante)
├── lib/paths.js
├── public/                            # Frontend für Node-Variante
├── package.json
└── README.md
```
