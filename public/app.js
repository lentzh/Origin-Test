'use strict';

const form = document.getElementById('search-form');
const tvidInput = document.getElementById('tvid');
const progQualityInput = document.getElementById('progQuality');
const renditionsInput = document.getElementById('renditions');
const broadcasterInput = document.getElementById('broadcaster');
const searchBtn = document.getElementById('search-btn');
const btnText = searchBtn.querySelector('.btn-text');
const spinner = searchBtn.querySelector('.spinner');
const parseInfo = document.getElementById('parse-info');
const errorBox = document.getElementById('error');
const results = document.getElementById('results');
const matrixBody = document.getElementById('matrix-body');

const FORMAT_LABELS = {
  mp4: { name: 'Progressive (MP4)', ext: '*.mp4' },
  hls: { name: 'Adaptive HLS', ext: '*.m3u8' },
  dash: { name: 'Adaptive DASH', ext: '*.mpd' },
};

function setLoading(isLoading) {
  searchBtn.disabled = isLoading;
  spinner.hidden = !isLoading;
  btnText.textContent = isLoading ? 'Prüfe…' : 'Verfügbarkeit prüfen';
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const tvId = tvidInput.value.trim();
  if (!tvId) return;

  setLoading(true);
  renderSkeleton();

  try {
    const res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tvId,
        progQuality: progQualityInput.value.trim() || undefined,
        renditions: renditionsInput.value.trim() || undefined,
        broadcaster: broadcasterInput.value.trim() || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      results.hidden = true;
      showError(data.error || 'Unbekannter Fehler.');
      return;
    }

    parseInfo.textContent = `Erkannte ID: ${data.base}  •  Pfad: /${broadcasterInput.value.trim() || 'progressive'}/${data.parsed.year}/${data.parsed.monthDay}/`;
    renderResults(data);
  } catch (err) {
    results.hidden = true;
    showError('Anfrage fehlgeschlagen: ' + (err.message || err));
  } finally {
    setLoading(false);
  }
});

function renderSkeleton() {
  results.hidden = false;
  const formatIds = ['mp4', 'hls', 'dash'];
  const envCount = 3;
  matrixBody.innerHTML = formatIds
    .map((fid) => {
      const f = FORMAT_LABELS[fid];
      const cells = Array.from({ length: envCount })
        .map(
          () => `<td><div class="cell-inner"><span class="status loading">…</span></div></td>`
        )
        .join('');
      return `<tr>
        <td class="format-cell"><span class="format-name">${f.name}</span><span class="format-ext">${f.ext}</span></td>
        ${cells}
      </tr>`;
    })
    .join('');
}

function renderResults(data) {
  results.hidden = false;
  matrixBody.innerHTML = '';

  data.formats.forEach((fmt) => {
    const tr = document.createElement('tr');

    const labelTd = document.createElement('td');
    labelTd.className = 'format-cell';
    labelTd.innerHTML = `<span class="format-name">${fmt.label}</span><span class="format-ext">${fmt.ext}</span>`;
    tr.appendChild(labelTd);

    data.environments.forEach((env) => {
      const info = env.formats[fmt.id];
      const td = document.createElement('td');
      const ok = info.available;

      const statusTitle = info.error
        ? `Fehler: ${info.error}`
        : `HTTP ${info.status || '-'}`;

      const td_inner = document.createElement('div');
      td_inner.className = 'cell-inner';
      td_inner.innerHTML = `
        <span class="status ${ok ? 'ok' : 'fail'}" title="${statusTitle}">${ok ? '✓' : '✕'}</span>
        <span class="status-code">${info.error ? info.error : 'HTTP ' + (info.status || '-')}</span>
      `;

      const playBtn = document.createElement('button');
      playBtn.className = 'btn-play';
      playBtn.innerHTML = '<span class="tri">▶</span> Abspielen';
      playBtn.disabled = !ok;
      playBtn.addEventListener('click', () =>
        openPlayer(fmt.id, info.url, `${fmt.label} – ${env.name}`)
      );
      td_inner.appendChild(playBtn);

      td.appendChild(td_inner);
      tr.appendChild(td);
    });

    matrixBody.appendChild(tr);
  });
}

/* ---------------- Player ---------------- */

const modal = document.getElementById('player-modal');
const video = document.getElementById('video');
const playerTitle = document.getElementById('player-title');
const playerUrl = document.getElementById('player-url');
const playerError = document.getElementById('player-error');
const openTab = document.getElementById('open-tab');
const copyUrlBtn = document.getElementById('copy-url');

let hlsInstance = null;
let dashInstance = null;

function teardownPlayer() {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
  if (dashInstance) {
    dashInstance.reset();
    dashInstance = null;
  }
  video.removeAttribute('src');
  video.load();
}

function showPlayerError(msg) {
  playerError.textContent = msg;
  playerError.hidden = false;
}

function openPlayer(type, url, title) {
  playerError.hidden = true;
  playerTitle.textContent = title;
  playerUrl.textContent = url;
  openTab.href = url;
  modal.hidden = false;
  teardownPlayer();

  if (type === 'mp4') {
    video.src = url;
    video.play().catch(() => {});
  } else if (type === 'hls') {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari: natives HLS
      video.src = url;
      video.play().catch(() => {});
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          showPlayerError(
            'HLS-Fehler: ' + (data.details || data.type) + '. Evtl. CORS-Einschränkung der Origin.'
          );
        }
      });
    } else {
      showPlayerError('HLS wird von diesem Browser nicht unterstützt.');
    }
  } else if (type === 'dash') {
    if (window.dashjs) {
      dashInstance = window.dashjs.MediaPlayer().create();
      dashInstance.initialize(video, url, true);
      dashInstance.on('error', (e) => {
        showPlayerError('DASH-Fehler: ' + (e.error?.message || JSON.stringify(e.error)) + '. Evtl. CORS-Einschränkung der Origin.');
      });
    } else {
      showPlayerError('DASH-Player (dash.js) nicht geladen.');
    }
  }
}

function closePlayer() {
  modal.hidden = true;
  teardownPlayer();
}

modal.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-close')) closePlayer();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closePlayer();
});

copyUrlBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(playerUrl.textContent);
    copyUrlBtn.textContent = 'Kopiert ✓';
    setTimeout(() => (copyUrlBtn.textContent = 'URL kopieren'), 1500);
  } catch {
    /* ignore */
  }
});

// Beispiel-ID vorbefuellen
tvidInput.value = 'TV-20260522-1800-5711.hq.mp4';
