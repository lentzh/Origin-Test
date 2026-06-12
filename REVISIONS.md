# Revisionshistorie – S3-Origin Verfügbarkeitscheck

## Version 1.1

**Stand:** Renditions-Katalog **LRA NDR** aus aktualisierter `renditions.xlsx`

### Änderungen

- **21 Formate** aus der Excel-Tabelle (NDR), u. a.:
  - Audio: MP4 (nur Audio) `.ao.mp4`
  - AVC: mn, ln, hq, hd, 1080 (+ veraltete lo, hi, lp)
  - HEVC: SDR 540/720/1080, HDR 1080/1440/2160
  - VP9: 540/720/1080
  - Flash LOW/HIGH/(L): historisch, ohne prüfbare URL (Anzeige „—“)
- **LRA-Modell:** Katalog unter `LRA_CATALOG.lras` – vorbereitet für weitere LRAs
- **Import:** `python3 tools/import-renditions.py` liest `renditions.xlsx` und aktualisiert
  - `lib/renditions-catalog.json`
  - eingebetteten Katalog in `origin-availability-checker.html`
- Metadaten je Format: Bezeichnung, Profil-Tag, Endung, Auflösung, Codec, Bemerkung
- **Audio-IDs** (`AU-YYYYMMDD-NNNN-NNNN`): eine Rendition (`.mp3`), vereinfachte Matrix (nur MP3-Spalte), HTML5-Audio-Player
- **Pfad-Segment:** Auslieferpfad nutzt `/progressive/` statt `/ndr/` (MP4, HLS, DASH, MP3)

### Quelle

| Datei | Beschreibung |
| --- | --- |
| `renditions.xlsx` | Master-Tabelle LRA NDR (Format, Profil, Endung, Auflösung, Codec, Bemerkung) |

---

## Version 1.0

**Stand:** Erste freigegebene Standalone-Version (`origin-availability-checker.html`)

### Zweck

- Prüfung der Verfügbarkeit von Videoinhalten auf den ARD-MCDN S3-Origin-Umgebungen **Dev**, **Stage** und **Prod**
- Unterstützung bei der Fehlersuche durch Anzeige von **Ausspielpfad** und vollständiger URL

### Eingabe

- Suche über die **reine TV-ID** im Format `TV-YYYYMMDD-HHMM-NNNN`
- Optionale Angabe des **Senders** (Standard: `ndr`)

### Verfügbarkeitsprüfung & Player

- Kompakte Matrix ✓/✕, Tabs Dev/Stage/Prod, separater Player-Bereich

### Technik

- Einzelne HTML-Datei, hls.js / dash.js bei Bedarf
