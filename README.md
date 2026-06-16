# S3-Origin Verfügbarkeitscheck · Version 1.3

Prüfung der Verfügbarkeit von Video- und Audio-Inhalten auf den ARD-MCDN S3-Origin-Umgebungen
**(Dev / Stage / Prod)**.

Repository (ARD): <https://gitlab.ard.de/zapv/origin-checker>  
Spiegel: <https://github.com/lentzh/Origin-Test>

## Standalone (empfohlen)

Datei **`origin-availability-checker.html`** im Projektroot öffnen (Doppelklick oder „Öffnen mit“ im Browser). Kein `npm install`, kein Server nötig.

| Funktion | Beschreibung |
| --- | --- |
| TV-ID | Reine Basis-ID `TV-YYYYMMDD-HHMM-NNNN`; alle Qualitäts-Suffixe werden automatisch geprüft |
| AU-ID | Audio `AU-YYYYMMDD-NNNN-NNNN` – nur MP3, vereinfachte Matrix |
| Auslieferung | In der **Kopfleiste** wählbar (Mehrfachauswahl): `progressive/`, `progressive_geo/`, `progressive_geo_dach/` |
| Renditions | LRA NDR: 21 Formate aus `renditions.xlsx` |
| Formate | MP4, HLS, DASH, MP3 (Audio) |
| Umgebungen | Dev / Stage / Prod per Tab |
| Übersicht | Kompakte Matrix mit ✓ / ✕, gruppiert nach Verzeichnis |
| Player | Separater Bereich mit Ausspielpfad, Abspielen, Neu Laden |

Revisionshistorie: **[REVISIONS.md](REVISIONS.md)** (V1.0 – V1.3).

## Auslieferungsverzeichnisse (V1.3)

| Option | Verzeichnis | Bedeutung |
| --- | --- | --- |
| Ohne GEO-Blocking | `progressive/` | Weltweit ohne GEO-Einschränkung |
| Mit GEO-Blocking | `progressive_geo/` | Mit GEO-Blocking |
| Nur GEO-DACH | `progressive_geo_dach/` | Nur DACH-Region |

Mehrere Optionen gleichzeitig möglich – die Anwendung prüft dann alle gewählten Pfade.

## Node/Express-Variante (älterer Stand)

```bash
npm install
npm start
```

→ <http://localhost:3000> (funktional hinter der Standalone)

## Origin-Umgebungen

| Umgebung | URL |
| --- | --- |
| Dev | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-dev.de` |
| Stage | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-qs.de` |
| Prod | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn.de` |

## Projektstruktur

```
.
├── origin-availability-checker.html   # Standalone V1.3
├── renditions.xlsx
├── lib/renditions-catalog.json
├── tools/import-renditions.py
├── tools/gitlab-setup.sh
├── REVISIONS.md
├── AGENTS.md
└── README.md
```
