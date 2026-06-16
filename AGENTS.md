# AGENTS.md – origin-checker

Leitfaden für KI-Assistenten (Cursor Agents) in diesem Repository.

## Zweck

**S3-Origin Verfügbarkeitscheck** (Version **1.3**): Prüfung von Video- und Audio-Medien auf den ARD-MCDN S3-Origin-Umgebungen Dev, Stage und Prod.

- **Standalone (primär):** `origin-availability-checker.html`
- **Node/Express (sekundär):** älterer Stand, nicht feature-parität

## Version 1.3 (aktuell)

- **GEO-Auslieferung:** Mehrfachauswahl in der blauen Kopfleiste (Checkboxen)
- Verzeichnisse: `progressive`, `progressive_geo`, `progressive_geo_dach`
- Matrix und Prüflogik iterieren über alle gewählten Verzeichnisse

## Auslieferungsverzeichnisse

| ID | Pfad-Segment | Bedeutung |
| --- | --- | --- |
| `progressive` | `progressive/` | Ohne GEO-Blocking |
| `progressive_geo` | `progressive_geo/` | Mit GEO-Blocking |
| `progressive_geo_dach` | `progressive_geo_dach/` | Nur GEO-DACH |

Konstante in HTML: `DELIVERY_VARIANTS`. Auswahl: `getSelectedDeliveryVariants()`.

## Pfadmuster

`{pathSegment}` = eines der drei Verzeichnisse oben.

| Format | URL-Muster |
| --- | --- |
| MP4 | `{origin}/{pathSegment}/{Jahr}/{MonatTag}/{TV-ID}.{suffix}.mp4` |
| HLS | `{origin}/i/{pathSegment}/{Jahr}/{MonatTag}/{TV-ID}.,{tag},.mp4.csmil/master.m3u8` |
| DASH | `{origin}/i/{pathSegment}/{Jahr}/{MonatTag}/{TV-ID}.,{tag},.mp4.csmil/dash.mpd` |
| MP3 | `{origin}/{pathSegment}/{Jahr}/{MonatTag}/{AU-ID}.mp3` |

## Cache-Struktur (nach Prüfung)

```
cache.envs[envId].variants[variantId].renditions[rendId].formats[fmtId]
cache.envs[envId].variants[variantId].formats.mp3   // Audio
```

`selectedSlot` enthält `variantId`, `rendId`, `fmtId`.

## Wichtige Dateien

| Datei | Rolle |
| --- | --- |
| `origin-availability-checker.html` | Hauptanwendung |
| `REVISIONS.md` | Release-Notes |
| `tools/import-renditions.py` | Katalog-Import |

## Entwicklungsregeln

- Standalone-HTML = Quelle der Wahrheit
- GEO-Auswahl nur in der Kopfleiste, nicht in erweiterten Optionen
- Bei Änderung der GEO-Auswahl: Cache invalidieren, Nutzer zur erneuten Prüfung auffordern
- Version bei Releases: UI, `REVISIONS.md`, `README.md`, `AGENTS.md`, Katalog-`version`
- UI-Texte auf Deutsch

## Git-Remotes

| Remote | Ziel |
| --- | --- |
| `gitlab` | `https://gitlab.ard.de/zapv/origin-checker` |
| `origin` | GitHub-Spiegel |

## Nicht tun

- Pfad-Segment nicht auf `ndr` zurücksetzen
- Node-Variante nicht ohne Auftrag auf Standalone-Parität bringen
- Secrets committen
