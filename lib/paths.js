// Zentrale Logik zum Ableiten der Origin-URLs aus einer TV-ID.
// Wird vom Backend (server.js) verwendet.

export const ENVIRONMENTS = [
  { id: 'dev', name: 'Dev', origin: 'https://ndrprogdev.cloudfront-legacy.vodorig.ard-mcdn-dev.de' },
  { id: 'stage', name: 'Stage', origin: 'https://ndrprogstage.cloudfront-legacy.vodorig.ard-mcdn-stage.de' },
  { id: 'prod', name: 'Prod', origin: 'https://ndrprogprod.cloudfront-legacy.vodorig.ard-mcdn-prod.de' },
];

// Standardwerte fuer die Qualitaets-/Rendition-Bezeichner.
export const DEFAULT_PROG_QUALITY = 'hd';
export const DEFAULT_RENDITIONS = 'hd,hq';
export const DEFAULT_BROADCASTER = 'progressive';

/** Auslieferungsverzeichnisse (Standalone V1.3+) */
export const DELIVERY_VARIANTS = [
  { id: 'progressive', path: 'progressive', label: 'Ohne GEO-Blocking' },
  { id: 'progressive_geo', path: 'progressive_geo', label: 'Mit GEO-Blocking' },
  { id: 'progressive_geo_dach', path: 'progressive_geo_dach', label: 'Nur GEO-DACH' },
];

// Erkennt eine TV-ID in der Form TV-YYYYMMDD-HHMM-NNNN(.qual)(.mp4).
// Beispiele:
//   TV-20260522-1800-5711.hq.mp4
//   TV-20260522-1800-5711
const TV_ID_REGEX = /TV-(\d{4})(\d{2})(\d{2})-(\d{4})-(\d+)/i;

/**
 * Zerlegt eine TV-ID in ihre Bestandteile.
 * @param {string} input
 * @returns {{ base:string, year:string, month:string, day:string, monthDay:string, time:string, seq:string } | null}
 */
export function parseTvId(input) {
  if (!input) return null;
  const match = String(input).trim().match(TV_ID_REGEX);
  if (!match) return null;
  const [, year, month, day, time, seq] = match;
  return {
    base: `TV-${year}${month}${day}-${time}-${seq}`,
    year,
    month,
    day,
    monthDay: `${month}${day}`,
    time,
    seq,
  };
}

/**
 * Baut die drei Format-URLs fuer eine gegebene Origin und TV-ID.
 * @param {string} origin       z.B. https://...dev.de
 * @param {ReturnType<typeof parseTvId>} parsed
 * @param {object} [opts]
 * @param {string} [opts.progQuality]  Qualitaet fuer Progressive Download (Default: hd)
 * @param {string} [opts.renditions]   Komma-Liste der Adaptive-Renditions (Default: hd,hq)
 * @param {string} [opts.broadcaster]  Pfad-Segment (Default: progressive)
 */
export function buildUrls(origin, parsed, opts = {}) {
  const progQuality = (opts.progQuality || DEFAULT_PROG_QUALITY).trim();
  const broadcaster = (opts.broadcaster || DEFAULT_BROADCASTER).trim();

  // Renditions bereinigen -> ergibt z.B. ".,hd,hq,.mp4.csmil"
  const renditions = (opts.renditions || DEFAULT_RENDITIONS)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .join(',');

  const { base, year, monthDay } = parsed;
  const csmil = `${base}.,${renditions},.mp4.csmil`;

  return {
    mp4: `${origin}/${broadcaster}/${year}/${monthDay}/${base}.${progQuality}.mp4`,
    hls: `${origin}/i/${broadcaster}/${year}/${monthDay}/${csmil}/master.m3u8`,
    dash: `${origin}/i/${broadcaster}/${year}/${monthDay}/${csmil}/dash.mpd`,
  };
}

export const FORMATS = [
  { id: 'mp4', label: 'Progressive (MP4)', ext: '*.mp4' },
  { id: 'hls', label: 'Adaptive HLS', ext: '*.m3u8' },
  { id: 'dash', label: 'Adaptive DASH', ext: '*.mpd' },
];
