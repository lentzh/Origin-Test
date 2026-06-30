# S3-Origin Verfügbarkeitscheck · Version 1.4

Prüfung der Verfügbarkeit von Video- und Audio-Inhalten auf **einer** ARD-MCDN S3-Origin-Umgebung (Dev, Stage oder Prod).

Repository (ARD): <https://gitlab.ard.de/zapv/origin-checker>  
Spiegel: <https://github.com/lentzh/Origin-Test>

## Standalone (empfohlen)

Datei **`origin-availability-checker.html`** im Browser öffnen.

| Schritt | Aktion |
| --- | --- |
| 1 | **Umgebung** wählen: Dev, Stage oder Prod |
| 2 | **Auslieferung** in der Kopfleiste: `progressive/`, `progressive_geo/`, `progressive_geo_dach/` (Mehrfachauswahl) |
| 3 | **TV-ID** oder **AU-ID** eingeben und prüfen |

| Funktion | Beschreibung |
| --- | --- |
| TV-ID | `TV-YYYYMMDD-HHMM-NNNN` – alle Renditions × MP4/HLS/DASH |
| AU-ID | `AU-YYYYMMDD-NNNN-NNNN` – nur MP3 |
| Prüfung | Nur die gewählte Umgebung, stabile sequenzielle Abarbeitung mit Fortschritt |

Revisionshistorie: **[REVISIONS.md](REVISIONS.md)**

## Version 1.4 – Wichtigste Änderungen

- Kein automatischer Lauf gegen Dev **und** Stage **und** Prod mehr
- Schnellere, zuverlässigere Checks (kein Hängen bei vielen Renditions)
- MP3- und Manifest-Prüfung verbessert

## Origin-Umgebungen

| Umgebung | URL |
| --- | --- |
| Dev | `https://ndrprogdev.cloudfront-legacy.vodorig.ard-mcdn-dev.de` |
| Stage | `https://ndrprogstage.cloudfront-legacy.vodorig.ard-mcdn-stage.de` |
| Prod | `https://ndrprogprod.cloudfront-legacy.vodorig.ard-mcdn-prod.de` |

## Projektstruktur

```
.
├── origin-availability-checker.html   # Standalone V1.4
├── REVISIONS.md
├── AGENTS.md
└── tools/import-renditions.py
```
