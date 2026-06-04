# Revisionshistorie – S3-Origin Verfügbarkeitscheck

## Version 1.1

**Stand:** Erweiterter Renditions-Katalog aus `renditions.xlsx`

### Änderungen

- **17 Renditions** in drei Gruppen:
  - **AVC (H.264):** 1080, hd, hq, ln, mn, ao, lo, lp
  - **HEVC:** WebL/WebXL/1080 SDR, 1080/1440/2160 HDR (aus Excel)
  - **VP9:** WebL/WebXL/1080 (aus Excel, Hinweis „2024 weggefallen“)
- Metadaten pro Rendition: Bezeichnung, Auflösung, Codec, Bemerkung, ARD-Bezeichnung (soweit in Excel)
- URL-Bildung für zusammengesetzte Suffixe (`hq.hevc`, `1080.hdr.hevc`, `hq.vp9`, …)
- Gruppenzeilen in der Verfügbarkeitsmatrix

### Quelle

| Datei | Beschreibung |
| --- | --- |
| `renditions.xlsx` | Master-Tabelle (Format, Endung, Auflösung, Codec, Bemerkung, ARD-Bezeichnung) |

---

## Version 1.0

**Stand:** Erste freigegebene Standalone-Version (`origin-availability-checker.html`)

### Zweck

- Prüfung der Verfügbarkeit von Videoinhalten auf den ARD-MCDN S3-Origin-Umgebungen **Dev**, **Stage** und **Prod**
- Unterstützung bei der Fehlersuche durch Anzeige von **Ausspielpfad** und vollständiger URL

### Eingabe

- Suche über die **reine TV-ID** im Format `TV-YYYYMMDD-HHMM-NNNN` (ohne Qualitäts-Suffix)
- Automatische Bereinigung von Suffixen und Pfadanteilen aus der Eingabe
- Optionale Angabe des **Senders** (Standard: `ndr`)

### Verfügbarkeitsprüfung

- Automatische Abfrage aller Qualitätsstufen je **MP4 / HLS / DASH**
- **URL-Ableitung** per Regex aus TV-ID, Datum und Sender-Pfad (`/ndr/JJJJ/MMTT/`)
- Umschaltung **Dev / Stage / Prod** per Tab
- Kompakte Übersicht mit ✓ / ✕

### Player

- Separater Player-Bereich: Abspielen, Neu Laden, Tab öffnen, URL kopieren

### Origin-URLs

| Umgebung | URL |
| --- | --- |
| Dev | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-dev.de` |
| Stage | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-qs.de` |
| Prod | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn.de` |

### Technik

- Einzelne HTML-Datei, plattformunabhängig
- hls.js / dash.js (jsDelivr), bei Bedarf geladen
