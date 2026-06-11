# AGENTS.md – origin-checker

Leitfaden für KI-Assistenten (Cursor Agents) in diesem Repository.

## Zweck

**S3-Origin Verfügbarkeitscheck** (Version 1.1): Prüfung von Medien auf den ARD-MCDN S3-Origin-Umgebungen Dev, Stage und Prod.

- **Standalone (primär):** `origin-availability-checker.html` – eine HTML-Datei, läuft im Browser ohne Server.
- **Node/Express (sekundär):** `server.js` + `public/` – älterer Stand, nicht feature-parität zur Standalone.

## Eingabe-IDs

| Typ | Format | Prüfung |
| --- | --- | --- |
| Video | `TV-YYYYMMDD-HHMM-NNNN` | Alle Renditions aus Katalog × MP4 / HLS / DASH |
| Audio | `AU-YYYYMMDD-NNNN-NNNN` | Nur `.mp3`, eine Spalte in der Matrix |

Pfadmuster: `/{broadcaster}/{Jahr}/{MonatTag}/{ID}.{suffix}`

## Wichtige Dateien

| Datei | Rolle |
| --- | --- |
| `origin-availability-checker.html` | Hauptanwendung (UI, Prüflogik, eingebetteter Katalog) |
| `renditions.xlsx` | Master-Tabelle Renditions LRA NDR |
| `tools/import-renditions.py` | Excel → `lib/renditions-catalog.json` + Einbettung in HTML |
| `lib/renditions-catalog.json` | Generierter Katalog (`LRA_CATALOG.lras`) |
| `REVISIONS.md` | Versionshistorie |

## Renditions-Katalog aktualisieren

```bash
python3 tools/import-renditions.py
```

Danach `origin-availability-checker.html` und `lib/renditions-catalog.json` committen. Katalog-Marker in HTML: `/* CATALOG_START */` … `/* CATALOG_END */`.

## Entwicklungsregeln

- **Minimale Diffs:** Standalone-HTML ist die Quelle der Wahrheit für neue Features.
- **Keine Over-Engineering:** Bestehende Konventionen in der HTML-Datei beibehalten (Vanilla JS, keine Build-Pipeline).
- **LRA-Modell:** Katalog unter `LRA_CATALOG.lras`; neue LRAs in Excel + Import-Skript erweitern.
- **Sprache:** Nutzerkommunikation und UI-Texte auf Deutsch.
- **Commits:** Nur auf ausdrückliche Anfrage; keine Secrets (`.env`, Tokens) committen.

## Origin-URLs

| Umgebung | Origin |
| --- | --- |
| Dev | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-dev.de` |
| Stage | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-qs.de` |
| Prod | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn.de` |

## Branches

| Branch | Bedeutung |
| --- | --- |
| `main` | Stabiler Stand |
| `standalone` | Entwicklungszweig Standalone (mit `main` synchron halten) |

## Git-Remotes

| Remote | Ziel |
| --- | --- |
| `origin` | GitHub (privat/Spiegel) |
| `gitlab` | `https://gitlab.ard.de/zapv/origin-checker` (ARD) |

## Typische Aufgaben

1. **Neue Rendition:** Zeile in `renditions.xlsx`, Import-Skript, REVISIONS.md ergänzen.
2. **Audio/Video-Logik:** Parser (`parseContentId`), `runCheckAu` / `runCheckTv`, Matrix-Layout (`setMatrixLayout`).
3. **Player:** MP3 → `<audio>`, Video → `<video>` + hls.js/dash.js bei Bedarf.
4. **CORS-Hinweis:** Bei `file://` können Browser-Checks eingeschränkt sein – im UI dokumentiert.

## Nicht tun

- Node-Variante nicht automatisch auf Standalone-Parität bringen, außer explizit gewünscht.
- `node_modules/` nicht committen.
- Große Refactorings der monolithischen HTML ohne klaren Auftrag.
