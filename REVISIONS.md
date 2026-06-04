# Revisionshistorie – S3-Origin Verfügbarkeitscheck

## Version 1.0

**Stand:** Erste freigegebene Standalone-Version (`origin-availability-checker.html` auf Branch `standalone`)

### Zweck

- Prüfung der Verfügbarkeit von Videoinhalten auf den ARD-MCDN S3-Origin-Umgebungen **Dev**, **Stage** und **Prod**
- Unterstützung bei der Fehlersuche durch Anzeige von **Ausspielpfad** und vollständiger URL

### Eingabe

- Suche über die **reine TV-ID** im Format `TV-YYYYMMDD-HHMM-NNNN` (ohne Qualitäts-Suffix)
- Automatische Bereinigung von Suffixen (z. B. `.hq.mp4`) und Pfadanteilen aus der Eingabe
- Optionale Angabe des **Senders** (Standard: `ndr`)

### Verfügbarkeitsprüfung

- Automatische Abfrage aller **Qualitätsstufen (Renditions):** `1080`, `hd`, `hq`, `ln`, `mn`, `ao`, `lo`, `lp`
- Drei **Auslieferungsformate** je Rendition:
  - Progressive Download (MP4)
  - Adaptive HLS (M3U8)
  - Adaptive DASH (MPD)
- **URL-Ableitung** per Regex aus TV-ID, Datum und Sender-Pfad (`/ndr/JJJJ/MMTT/`)
- Prüfung aller drei Umgebungen beim Start; Umschaltung **Dev / Stage / Prod** per Tab ohne erneuten Lauf
- **Kompakte Übersicht** mit grünem Haken (verfügbar) und rotem Kreuz (nicht verfügbar)
- HTTP-Prüfung im Browser (HEAD/GET), bei Bedarf Fallback über Video-, HLS- oder DASH-Probes

### Player

- Separater **Player-Bereich** unter der Verfügbarkeitsübersicht
- Auswahl durch Klick auf eine Matrix-Zelle; Anzeige von Ausspielpfad und Status
- Wiedergabe für MP4 (nativ), HLS (hls.js / Safari nativ), DASH (dash.js)
- Funktionen: **Abspielen**, **Neu Laden**, **In neuem Tab öffnen**, **URL kopieren**

### Origin-URLs (V1.0)

| Umgebung | Origin |
| --- | --- |
| Dev | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-dev.de` |
| Stage | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn-qs.de` |
| Prod | `https://ndrprog.cloudfront-legacy.vodorig.ard-mcdn.de` |

### Technik

- Einzelne HTML-Datei, plattformunabhängig (Doppelklick / Browser, ohne Node-Server)
- Externe Abhängigkeit: hls.js und dash.js (jsDelivr), nur bei Bedarf geladen

### Bekannte Einschränkungen

- Browser-CORS kann direkte Prüfungen und Wiedergabe einschränken (Hinweis bei `file://`-Aufruf)
- Die Node/Express-Variante auf Branch `main` ist in V1.0 der Standalone-Version funktional nicht identisch (älterer Funktionsumfang)
