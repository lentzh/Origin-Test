import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ENVIRONMENTS,
  FORMATS,
  parseTvId,
  buildUrls,
} from './lib/paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;
const CHECK_TIMEOUT_MS = Number(process.env.CHECK_TIMEOUT_MS || 8000);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Prueft die Verfuegbarkeit einer URL serverseitig (umgeht CORS).
 * Versucht zuerst HEAD, faellt bei Bedarf auf GET mit Range zurueck.
 */
async function checkUrl(url) {
  const result = { available: false, status: 0, error: null };

  const attempt = async (method, headers) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method,
        headers,
        redirect: 'follow',
        signal: controller.signal,
      });
      return res;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let res = await attempt('HEAD', {});
    // Manche Origins/CDNs beantworten HEAD nicht zuverlaessig -> GET mit Range.
    if (!res.ok || res.status === 405 || res.status === 403) {
      res = await attempt('GET', { Range: 'bytes=0-0' });
    }
    result.status = res.status;
    result.available = res.status >= 200 && res.status < 400;
  } catch (err) {
    result.error = err.name === 'AbortError' ? 'timeout' : String(err.message || err);
  }

  return result;
}

app.post('/api/check', async (req, res) => {
  const { tvId, progQuality, renditions, broadcaster } = req.body || {};
  const parsed = parseTvId(tvId);

  if (!parsed) {
    return res.status(400).json({
      error:
        'Ungueltige TV-ID. Erwartetes Format: TV-YYYYMMDD-HHMM-NNNN (z. B. TV-20260522-1800-5711.hq.mp4)',
    });
  }

  const environments = await Promise.all(
    ENVIRONMENTS.map(async (env) => {
      const urls = buildUrls(env.origin, parsed, { progQuality, renditions, broadcaster });
      const formats = {};
      await Promise.all(
        FORMATS.map(async (fmt) => {
          const url = urls[fmt.id];
          const check = await checkUrl(url);
          formats[fmt.id] = { url, ...check };
        })
      );
      return { id: env.id, name: env.name, origin: env.origin, formats };
    })
  );

  res.json({
    tvId,
    base: parsed.base,
    parsed,
    formats: FORMATS,
    environments,
  });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Origin-Verfuegbarkeits-Checker laeuft auf http://localhost:${PORT}`);
});
