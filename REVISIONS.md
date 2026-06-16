# Revisionshistorie – S3-Origin Verfügbarkeitscheck

## Version 1.3

**Stand:** GEO-Auslieferungsverzeichnisse (Mehrfachauswahl)

### Änderungen

- **Drei Auslieferungsverzeichnisse** wählbar in der blauen Kopfleiste (Checkboxen, Mehrfachauswahl):
  - `progressive/` – ohne GEO-Blocking
  - `progressive_geo/` – mit GEO-Blocking
  - `progressive_geo_dach/` – nur GEO-DACH
- Prüfung und Matrix **je gewähltem Verzeichnis** (gruppierte Darstellung)
- Player zeigt gewähltes Verzeichnis im Titel

### Pfade (Beispiel)

| Verzeichnis | MP4 |
| --- | --- |
| Ohne GEO | `{origin}/progressive/{Jahr}/{MonatTag}/{TV-ID}.{suffix}.mp4` |
| GEO | `{origin}/progressive_geo/{Jahr}/{MonatTag}/{TV-ID}.{suffix}.mp4` |
| GEO-DACH | `{origin}/progressive_geo_dach/{Jahr}/{MonatTag}/{TV-ID}.{suffix}.mp4` |

HLS/DASH analog unter `/i/{verzeichnis}/…`, MP3 unter `/{verzeichnis}/…`.

---

## Version 1.2

**Stand:** Audio-IDs, Auslieferpfad `/progressive/`, GitLab-Repository

### Änderungen

- **Audio-IDs** (`AU-…`): nur MP3, vereinfachte Matrix, HTML5-Audio-Player
- Auslieferpfad-Segment `progressive` (statt `ndr`)
- `AGENTS.md`, GitLab-Projekt `origin-checker`

---

## Version 1.1

**Stand:** Renditions-Katalog **LRA NDR** aus aktualisierter `renditions.xlsx`

### Änderungen

- **21 Formate** aus der Excel-Tabelle (NDR)
- **LRA-Modell:** Katalog unter `LRA_CATALOG.lras`
- Import via `python3 tools/import-renditions.py`

---

## Version 1.0

**Stand:** Erste freigegebene Standalone-Version

- TV-ID-Prüfung, Matrix Dev/Stage/Prod, separater Player
