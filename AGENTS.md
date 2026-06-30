# AGENTS.md – origin-checker

Leitfaden für KI-Assistenten (Cursor Agents).

## Version 1.4 (aktuell)

**S3-Origin Verfügbarkeitscheck** – Standalone in `origin-availability-checker.html`.

### Wichtig

- **Eine Umgebung pro Lauf:** Nutzer wählt Dev, Stage oder Prod **vor** dem Start (`getSelectedEnvironment()`)
- **GEO-Verzeichnisse:** Mehrfachauswahl in Kopfleiste (`getSelectedDeliveryVariants()`)
- **Kein** paralleles Abfragen aller drei Origins mehr

### Prüflogik

| Konstante | Wert | Bedeutung |
| --- | --- | --- |
| `CHECK_TIMEOUT_MS` | 6000 | Timeout pro Request |
| `CHECK_CONCURRENCY` | 5 | Max. parallele Checks |

- `mapPool()` – Worker-Pool für begrenzte Parallelität
- HLS/DASH: `fetchTextCheck` / Manifest (nicht hls.js/dash.js für Checks)
- MP3: `probeAudio()` (nicht `probeMp4`)
- Player nutzt weiterhin hls.js/dash.js bei Wiedergabe

### Cache-Struktur (V1.4)

```javascript
cache = {
  contentType: 'tv' | 'au',
  env: { id, name, origin },
  deliveryVariants: ['progressive', ...],
  variants: {
    progressive: { renditions: { ... } },  // TV
    // oder formats: { mp3: ... }          // AU
  }
}
```

**Nicht mehr:** `cache.envs[envId]` mit drei Umgebungen.

### Auslieferungsverzeichnisse

| ID | Pfad |
| --- | --- |
| `progressive` | Ohne GEO-Blocking |
| `progressive_geo` | Mit GEO-Blocking |
| `progressive_geo_dach` | Nur GEO-DACH |

### Pfadmuster

`{origin}/{pathSegment}/{Jahr}/{MonatTag}/{ID}…`

### Origin-URLs (V1.4+)

| Umgebung | Host |
| --- | --- |
| Dev | `ndrprogdev.cloudfront-legacy.vodorig.ard-mcdn-dev.de` |
| Stage | `ndrprogstage.cloudfront-legacy.vodorig.ard-mcdn-stage.de` |
| Prod | `ndrprogprod.cloudfront-legacy.vodorig.ard-mcdn-prod.de` |

### Bei Releases anpassen

UI-Version, `REVISIONS.md`, `README.md`, `AGENTS.md`, Katalog-`version` in `import-renditions.py`.

### Git

- `gitlab` → `gitlab.ard.de/zapv/origin-checker`
- `origin` → GitHub-Spiegel
