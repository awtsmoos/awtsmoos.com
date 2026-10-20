// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RashiController
 * @description
 * Rashi toggle for the Bavli daf reader. Adds a "Rashi" button to the reader's
 * floating controls on Bavli daf pages; toggling fetches Rashi's English
 * commentary for the current masechta+daf and renders it inline, matched by
 * ref to the daf segments.
 */

import { fetchRashiUnits, unitsForDaf, rashiSlugFor } from './rashi-api.js?v=rashi-001';

const BTN_ID = 'rashiBtn';
const PANEL_ID = 'rashiPanel';
const STORAGE_KEY = 'awtsmoos-rashi-open';

let state = {
  mounted: false,
  open: false,
  loading: false,
  masechta: null,
  daf: null,
  units: null,
  error: null,
};

/** Parse /heichelos/<h>/series/<seriesId>/post/<postId> */
function parseRoute() {
  const m = location.pathname.match(/\/heichelos\/[^/]+\/series\/([^/]+)\/post\/([^/?#]+)/);
  if (!m) return null;
  return { seriesId: decodeURIComponent(m[1]), postId: decodeURIComponent(m[2]) };
}

/**
 * Detects Bavli daf context. Supports:
 *  - postId "berachos-2a" (masechta-daf)
 *  - postId "bavli-nedarim-daf46" (custom bavli staging shape)
 *  - window.post { masechta, vilnaDaf }
 */
function detectBavli() {
  const post = window.post || {};
  // Direct fields win (custom Bavli posts carry masechta + vilnaDaf).
  if (post.masechta && (post.vilnaDaf || post.vilnaDaf === 0)) {
    const slug = rashiSlugFor(post.masechta);
    if (slug) return { masechta: post.masechta, daf: String(post.vilnaDaf), slug };
  }
  const route = parseRoute();
  if (!route) return null;
  let m = route.postId.match(/^bavli-(.+)-daf(\d+)$/i);
  if (m) {
    const slug = rashiSlugFor(m[1]);
    if (slug) return { masechta: m[1], daf: m[2], slug };
  }
  m = route.postId.match(/-(\d+[ab])$/i);
  if (m) {
    const daf = m[1].toLowerCase();
    const masechta = route.postId.slice(0, route.postId.length - daf.length - 1);
    const slug = rashiSlugFor(masechta) || rashiSlugFor(route.seriesId);
    if (slug) return { masechta, daf, slug };
  }
  // seriesId itself may be the masechta (e.g. series "berachos")
  const slug = rashiSlugFor(route.seriesId);
  if (slug) return { masechta: route.seriesId, daf: null, slug };
  return null;
}

function ensureButton() {
  if (document.getElementById(BTN_ID)) return document.getElementById(BTN_ID);
  const controls = document.querySelector('.awtsmoos-floating-controls');
  if (!controls) return null;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = BTN_ID;
  btn.className = 'awtsmoos-rashi-toggle';
  btn.title = "Rashi's commentary";
  btn.setAttribute('aria-label', "Toggle Rashi's commentary");
  btn.setAttribute('aria-expanded', 'false');
  btn.textContent = 'רש״י';
  btn.addEventListener('click', (e) => { e.preventDefault(); toggleRashi(); });
  controls.appendChild(btn);
  return btn;
}

function ensurePanel() {
  let panel = document.getElementById(PANEL_ID);
  if (panel) return panel;
  panel = document.createElement('section');
  panel.id = PANEL_ID;
  panel.className = 'awtsmoos-rashi-panel';
  panel.setAttribute('aria-label', "Rashi's commentary");
  panel.hidden = true;
  const article = document.querySelector('#realPost article')
    || document.querySelector('#realPost')
    || document.querySelector('.post-reader-localized-context');
  if (article && article.parentNode) {
    article.parentNode.insertBefore(panel, article.nextSibling);
  } else {
    document.body.appendChild(panel);
  }
  return panel;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function renderPanel() {
  const panel = ensurePanel();
  const btn = document.getElementById(BTN_ID);
  if (btn) btn.setAttribute('aria-expanded', String(state.open));
  if (!state.open) { panel.hidden = true; return; }
  panel.hidden = false;
  const dafLabel = state.daf ? ` · דף ${escapeHtml(state.daf)}` : '';
  let html = `<div class="rashi-panel-head">
    <h2 class="rashi-panel-title">רש״י · Rashi${dafLabel}</h2>
    <button type="button" class="rashi-panel-close" aria-label="Close Rashi">✕</button>
  </div><div class="rashi-panel-body">`;
  if (state.loading) {
    html += '<p class="rashi-status" role="status">Loading Rashi…</p>';
  } else if (state.error) {
    html += `<p class="rashi-status rashi-error" role="alert">${escapeHtml(state.error)}</p>`;
  } else if (!state.units || !state.units.length) {
    html += '<p class="rashi-status">No Rashi found for this daf yet.</p>';
  } else {
    // Group by segment: ref "2a:1#c0" -> segment "2a:1"
    const groups = new Map();
    for (const u of state.units) {
      const seg = (u.ref.split('#')[0] || u.ref).trim();
      if (!groups.has(seg)) groups.set(seg, []);
      groups.get(seg).push(u);
    }
    for (const [seg, items] of groups) {
      html += `<div class="rashi-segment" data-rashi-seg="${escapeHtml(seg)}">`;
      html += `<div class="rashi-seg-label">${escapeHtml(seg)}</div>`;
      for (const u of items) {
        html += '<article class="rashi-comment">';
        if (u.dibur) html += `<div class="rashi-dibur" lang="he" dir="rtl">${escapeHtml(u.dibur)}</div>`;
        if (u.hebrew) html += `<div class="rashi-he" lang="he" dir="rtl">${escapeHtml(u.hebrew)}</div>`;
        if (u.english) html += `<div class="rashi-en" lang="en" dir="ltr">${escapeHtml(u.english)}</div>`;
        html += '</article>';
      }
      html += '</div>';
    }
  }
  html += '</div>';
  panel.innerHTML = html;
  const close = panel.querySelector('.rashi-panel-close');
  if (close) close.addEventListener('click', () => toggleRashi(false));
}

async function loadRashi() {
  if (state.units || state.loading) return;
  state.loading = true;
  state.error = null;
  renderPanel();
  try {
    const all = await fetchRashiUnits(state.masechta, state.daf);
    state.units = unitsForDaf(all, state.daf);
  } catch (e) {
    state.error = 'Could not load Rashi right now. Try again in a moment.';
    console.warn('B"H rashi load failed', e);
  } finally {
    state.loading = false;
    renderPanel();
  }
}

export function toggleRashi(force) {
  state.open = typeof force === 'boolean' ? force : !state.open;
  try {
    if (state.open) localStorage.setItem(STORAGE_KEY, '1');
    else localStorage.removeItem(STORAGE_KEY);
  } catch (_) { /* private mode */ }
  const btn = document.getElementById(BTN_ID);
  if (btn) btn.classList.toggle('is-open', state.open);
  renderPanel();
  if (state.open) void loadRashi();
}

/**
 * Mounts the Rashi toggle if this is a Bavli daf page. Safe to call repeatedly.
 */
export function mountRashiToggle() {
  if (state.mounted) return true;
  const ctx = detectBavli();
  if (!ctx) return false;
  state.masechta = ctx.masechta;
  state.daf = ctx.daf;
  const btn = ensureButton();
  if (!btn) return false;
  ensurePanel();
  state.mounted = true;
  let reopen = false;
  try { reopen = localStorage.getItem(STORAGE_KEY) === '1'; } catch (_) {}
  if (reopen) toggleRashi(true);
  return true;
}

// Auto-mount on DOM ready + after client-side navigations.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => mountRashiToggle(), { once: true });
} else {
  mountRashiToggle();
}
