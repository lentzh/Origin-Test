# Revisionshistorie – S3-Origin Verfügbarkeitscheck

## Version 1.4

**Stand:** Einzel-Umgebungswahl, stabilere Verfügbarkeitsprüfung

### Änderungen

- **Umgebungswahl vor der Prüfung:** Dev, Stage oder Prod (Radio-Buttons) – es wird nur die gewählte Umgebung geprüft
- **Keine parallele 3×-Abfrage** mehr aller Origins (verhindert Hänger und Browser-Überlastung)
- **Prüflogik überarbeitet:**
  - Begrenzte Parallelität (`CHECK_CONCURRENCY = 5`)
  - HLS/DASH: leichtgewichtiger Manifest-Abruf (kein hls.js/dash.js pro Zelle)
  - MP3: dediziertes Audio-Element statt Video-Tag
  - Fetch mit `AbortController` und festem Timeout (6 s)
- Fortschrittsanzeige mit Zähler (erledigt/gesamt)
- **Origin-Hosts** je Umgebung: `ndrprogdev` / `ndrprogstage` / `ndrprogprod` (siehe README)

### Bekannte Hinweise

- „Nicht verfügbar“ bei vorhandenem S3-Inhalt kann an CORS, falscher Umgebung (Dev/Stage/Prod) oder falschem GEO-Verzeichnis liegen – jeweils passende Option wählen und erneut prüfen.

---

## Version 1.3

**Stand:** GEO-Auslieferungsverzeichnisse (Mehrfachauswahl)

- `progressive/`, `progressive_geo/`, `progressive_geo_dach/` in der Kopfleiste

---

## Version 1.2

- Audio-IDs (`AU-…`), Pfad `/progressive/`, GitLab `origin-checker`

---

## Version 1.1

- Renditions-Katalog LRA NDR (21 Formate)

---

## Version 1.0

- Erste Standalone-Version
