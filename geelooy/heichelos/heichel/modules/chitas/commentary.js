// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ChitasCommentary
 * @description
 * Bilingual (Hebrew + English) classical commentary for the Daily Chitas.
 * Rashi shows BY DEFAULT under every verse; Ramban and Ibn Ezra are
 * available through the commentator toggle (off by default).
 *
 * Data comes from the live `tanach` heichel API — never rebuilt locally:
 *   GET /api/social/heichelos/tanach/series/tanach-commentary-rishonim/post/<postId>
 *
 * PostId patterns (verified live):
 * - Rashi:    tanach-rashi-rashi-on-<book>-<chapter> (Genesis + Exodus only),
 *             fallback tanach-rashi-rashi-on-<book> (Leviticus/Numbers/Deuteronomy
 *             are whole-book posts). Unit refs look like "1:1#c0".
 * - Ramban:   tanach-ramban-ramban-on-<book>-body-p1 + -body-p2 (Genesis/Exodus);
 *             tanach-ramban-ramban-on-<book> (other books). Refs "body:ch1:1#c0".
 *             Introduction/foreword/supplement posts are skipped.
 * - Ibn Ezra: tanach-ibn-ezra-ibn-ezra-on-<book> (whole book). Refs "body:ch1:1#c0".
 *
 * Responses are cached aggressively: fetch `force-cache` plus an in-memory
 * map keyed by postId, so a whole-book post is downloaded at most once per
 * page session no matter how many verses need it.
 */

import { fetchChapter } from './verses.js';

export const COMMENTATORS = {
  rashi:   { key: 'rashi',   name: 'Rashi',    hebrewName: 'רש״י' },
  ramban:  { key: 'ramban',  name: 'Ramban',   hebrewName: 'רמב״ן' },
  ibnezra: { key: 'ibnezra', name: 'Ibn Ezra', hebrewName: 'אבן עזרא' },
};

const COMMENTATOR_ORDER = ['rashi', 'ramban', 'ibnezra'];
const DEFAULT_COMMENTATOR = 'rashi';
const STORAGE_KEY = 'chitas-commentator';

const BOOK_SLUGS = {
  genesis: 'genesis',
  exodus: 'exodus',
  leviticus: 'leviticus',
  numbers: 'numbers',
  deuteronomy: 'deuteronomy',
};

/** Maps the native Tanach range book seriesId (bereishis, shemos, …) to a slug. */
const TANACH_SERIES_BOOKS = {
  bereishis: 'genesis',
  shemos: 'exodus',
  vayikra: 'leviticus',
  bamidbar: 'numbers',
  devarim: 'deuteronomy',
};

const COMMENTARY_API = '/api/social/heichelos/tanach/series/tanach-commentary-rishonim/post/';
const COMMENTARY_STYLE_HREF = '/heichelos/heichel/modules/ui/render/living-path/chitas-daily.css?v=chitas-commentary-001';

/** postId -> raw units[] (fetch force-cache + in-memory). */
const postCache = new Map();
/** `${name}/${book}/${chapter}` -> normalized [{ref:'ch:v', he, en}]. */
const unitsCache = new Map();

function postIdsForCommentator(name, book, chapter) {
  const ch = String(Number(chapter) || chapter);
  if (name === 'rashi') {
    // Per-chapter posts exist for Genesis + Exodus; Leviticus/Numbers/
    // Deuteronomy ship as whole-book posts — try per-chapter first.
    return [`tanach-rashi-rashi-on-${book}-${ch}`, `tanach-rashi-rashi-on-${book}`];
  }
  if (name === 'ramban') {
    if (book === 'genesis' || book === 'exodus') {
      return [
        `tanach-ramban-ramban-on-${book}-body-p1`,
        `tanach-ramban-ramban-on-${book}-body-p2`,
      ];
    }
    return [`tanach-ramban-ramban-on-${book}`];
  }
  return [`tanach-ibn-ezra-ibn-ezra-on-${book}`];
}

async function fetchCommentaryPost(postId) {
  if (postCache.has(postId)) return postCache.get(postId);
  let units = [];
  try {
    const res = await fetch(`${COMMENTARY_API}${encodeURIComponent(postId)}`, { cache: 'force-cache' });
    if (res.ok) {
      const data = await res.json();
      if (data && !data.error && Array.isArray(data.units)) units = data.units;
    }
  } catch {
    units = [];
  }
  postCache.set(postId, units);
  return units;
}

/**
 * Matches "1:1#c0" and "body:ch1:1#c0"; skips "Introduction:p1" and friends.
 */
const VERSE_REF_RE = /(?:ch)?(\d+):(\d+)/;

function normalizeCommentaryUnit(u) {
  if (!u || typeof u !== 'object') return null;
  const m = VERSE_REF_RE.exec(String(u.ref || ''));
  if (!m) return null;
  const he = String(u.hebrew ?? u.he ?? '').trim();
  const en = String(u.english ?? u.en ?? '').trim();
  if (!he && !en) return null;
  return { chapter: Number(m[1]), verse: Number(m[2]), he, en };
}

/**
 * Fetches one commentator's units for a book chapter, normalized to
 * [{ref:'chapter:verse', he, en}]. Whole-book posts are filtered to the
 * requested chapter; Rashi falls back from per-chapter to whole-book posts.
 */
export async function fetchCommentator(name, book, chapter) {
  const slug = BOOK_SLUGS[String(book || '').toLowerCase()];
  if (!slug || !COMMENTATORS[name]) return [];
  const key = `${name}/${slug}/${chapter}`;
  if (unitsCache.has(key)) return unitsCache.get(key);
  const out = [];
  const wantChapter = Number(chapter);
  for (const postId of postIdsForCommentator(name, slug, chapter)) {
    const raw = await fetchCommentaryPost(postId);
    let added = 0;
    for (const u of raw) {
      const n = normalizeCommentaryUnit(u);
      if (!n || n.chapter !== wantChapter) continue;
      out.push({ ref: `${n.chapter}:${n.verse}`, he: n.he, en: n.en });
      added += 1;
    }
    // Rashi: a per-chapter hit means the whole-book fallback is unnecessary.
    if (name === 'rashi' && added > 0) break;
  }
  unitsCache.set(key, out);
  return out;
}

/** Convenience: Rashi units for one chapter. */
export function fetchRashi(book, chapter) {
  return fetchCommentator('rashi', book, chapter);
}

function parseChumashRef(ref) {
  // "Genesis 7:17" -> {book:'genesis', chapter:'7', verse:'17'}
  const m = String(ref || '').match(/^(\w+)\s+(\d+):(\d+)/);
  if (!m) return null;
  const slug = BOOK_SLUGS[m[1].toLowerCase()];
  if (!slug) return null;
  return { book: slug, chapter: m[2], verse: m[3] };
}

/** "7:17" / "7:17a" -> "7:17" — canonical lookup key for verse grouping. */
export function verseKey(ref) {
  const parts = String(ref || '').split(':');
  if (parts.length < 2) return String(ref || '');
  return `${parseInt(parts[0], 10)}:${parseInt(parts[1], 10)}`;
}

/**
 * Commentary for an explicit list of verse refs ("7:17"), grouped by verse.
 * @returns {Promise<Map<string, Array<{he:string,en:string}>>>} keyed by verseKey.
 */
export async function commentaryMapForVerses(name, book, verseRefs) {
  const byRef = new Map();
  const chapters = [...new Set(
    (Array.isArray(verseRefs) ? verseRefs : []).map(r => String(r).split(':')[0]).filter(Boolean)
  )];
  await Promise.all(chapters.map(async (ch) => {
    const units = await fetchCommentator(name, book, ch);
    for (const u of units) {
      const key = verseKey(u.ref);
      if (!byRef.has(key)) byRef.set(key, []);
      byRef.get(key).push({ he: u.he, en: u.en });
    }
  }));
  return byRef;
}

/**
 * Commentary for a reference range like "Genesis 7:17" -> "Genesis 8:14",
 * grouped by verse: [{ref:'7:17', comments:[{he,en}]}]. Mirrors
 * verses.js `versesForRange`.
 */
export async function commentaryForRange(name, startRef, endRef, maxVerses = 0) {
  const s = parseChumashRef(startRef);
  const e = parseChumashRef(endRef);
  if (!s || !e || s.book !== e.book) return [];
  const out = [];
  const startCh = parseInt(s.chapter, 10);
  const endCh = parseInt(e.chapter, 10);
  const startV = parseInt(s.verse, 10);
  const endV = parseInt(e.verse, 10);
  for (let ch = startCh; ch <= endCh; ch++) {
    const units = await fetchCommentator(name, s.book, String(ch));
    let lastRef = '';
    for (const u of units) {
      const uv = parseInt(String(u.ref).split(':')[1], 10);
      if (ch === startCh && uv < startV) continue;
      if (ch === endCh && uv > endV) continue;
      if (u.ref === lastRef && out.length) {
        out[out.length - 1].comments.push({ he: u.he, en: u.en });
      } else {
        out.push({ ref: u.ref, comments: [{ he: u.he, en: u.en }] });
        lastRef = u.ref;
      }
      if (maxVerses > 0 && out.length >= maxVerses) return out;
    }
  }
  return out;
}

/** Convenience: Rashi grouped by verse for a range. */
export function rashiForRange(startRef, endRef, maxVerses = 0) {
  return commentaryForRange('rashi', startRef, endRef, maxVerses);
}

/**
 * Ordered verse refs ("7:17") for a range, from the small chapter verse
 * files — used to map rendered verse chunks back to their pasuk.
 */
export async function verseRefsForRange(startRef, endRef) {
  const s = parseChumashRef(startRef);
  const e = parseChumashRef(endRef);
  if (!s || !e || s.book !== e.book) return [];
  const out = [];
  const startCh = parseInt(s.chapter, 10);
  const endCh = parseInt(e.chapter, 10);
  const startV = parseInt(s.verse, 10);
  const endV = parseInt(e.verse, 10);
  for (let ch = startCh; ch <= endCh; ch++) {
    const verses = await fetchChapter(s.book, String(ch));
    for (const v of verses) {
      const vn = parseInt(String(v.v).replace(/\D/g, ''), 10);
      if (!vn) continue;
      if (ch === startCh && vn < startV) continue;
      if (ch === endCh && vn > endV) continue;
      out.push(`${ch}:${vn}`);
    }
  }
  return out;
}

/* ------------------------------ preferences ------------------------------ */

export function getStoredCommentator() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && COMMENTATORS[v]) return v;
  } catch { /* ignore */ }
  return DEFAULT_COMMENTATOR;
}

export function setStoredCommentator(name) {
  if (!COMMENTATORS[name]) return;
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch { /* ignore */ }
}

/** "Rashi · רש״י" — clear attribution for every commentary block. */
export function commentatorLabel(name) {
  const c = COMMENTATORS[name] || COMMENTATORS[DEFAULT_COMMENTATOR];
  return `${c.name} · ${c.hebrewName}`;
}

/* ------------------------------ DOM builders ------------------------------ */

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

function heEl(tag, className, text) {
  const e = el(tag, className, text);
  e.dir = 'rtl';
  e.lang = 'he';
  return e;
}

/**
 * Builds one attributed bilingual commentary block:
 * label ("Rashi · רש״י"), then Hebrew, then English per comment.
 */
export function buildCommentaryBlock(name, comments, extraClass) {
  const wrap = el('div', `chitas-commentary${extraClass ? ` ${extraClass}` : ''}`);
  wrap.dataset.commentator = COMMENTATORS[name] ? name : DEFAULT_COMMENTATOR;
  wrap.append(el('p', 'chitas-commentary-label', commentatorLabel(name)));
  for (const c of (Array.isArray(comments) ? comments : [])) {
    const cEl = el('div', 'chitas-comment');
    if (c.he) cEl.append(heEl('p', 'chitas-commentary-he', c.he));
    if (c.en) cEl.append(el('p', 'chitas-commentary-en', c.en));
    if (cEl.childElementCount) wrap.append(cEl);
  }
  return wrap;
}

/**
 * Segmented commentator control. Rashi is the default ON position; the
 * choice persists in localStorage via the onChange handler's owner.
 */
export function createCommentatorToggle(activeName, onChange) {
  const wrap = el('div', 'chitas-commentator-toggle');
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', 'Commentary');
  const label = el('span', 'chitas-commentator-toggle-label', 'Commentary:');
  wrap.append(label);
  const buttons = {};
  const sync = (name) => {
    wrap.dataset.active = name;
    for (const k of COMMENTATOR_ORDER) {
      buttons[k].classList.toggle('is-active', k === name);
      buttons[k].setAttribute('aria-pressed', k === name ? 'true' : 'false');
    }
  };
  for (const key of COMMENTATOR_ORDER) {
    const b = el('button', 'chitas-commentator-btn', COMMENTATORS[key].name);
    b.type = 'button';
    b.dataset.commentator = key;
    b.addEventListener('click', () => {
      if (wrap.dataset.active === key) return;
      sync(key);
      try { onChange(key); } catch { /* ignore */ }
    });
    buttons[key] = b;
    wrap.append(b);
  }
  sync(COMMENTATORS[activeName] ? activeName : DEFAULT_COMMENTATOR);
  wrap.update = sync;
  return wrap;
}

function ensureCommentaryStyle() {
  try {
    if (document.querySelector(`link[href="${COMMENTARY_STYLE_HREF}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = COMMENTARY_STYLE_HREF;
    document.head.appendChild(link);
  } catch { /* ignore */ }
}

function waitForElement(find, timeoutMs = 12000) {
  return new Promise((resolve) => {
    const attempt = () => {
      try { return find(); } catch { return null; }
    };
    const immediate = attempt();
    if (immediate) { resolve(immediate); return; }
    let done = false;
    const finish = (node) => {
      if (done) return;
      done = true;
      try { obs.disconnect(); } catch { /* ignore */ }
      resolve(node || null);
    };
    const obs = new MutationObserver(() => {
      const node = attempt();
      if (node) finish(node);
    });
    try {
      obs.observe(document.documentElement, { childList: true, subtree: true });
    } catch { finish(attempt()); return; }
    setTimeout(() => finish(attempt()), timeoutMs);
  });
}

/**
 * Full-post-page enhancement: injects the active commentator's commentary
 * under every rendered verse chunk, with the shared toggle. Called from the
 * dynamic Chitas post loader; self-scheduling and failure-safe — the verses
 * always render even when commentary cannot load.
 */
export function initChitasPostCommentary(post) {
  try {
    const range = post?.dayuh?.meta?.nativeTanachRange;
    if (!range || !range.startChapter) return false;
    const rawBook = String(range.book || '').toLowerCase();
    const book = TANACH_SERIES_BOOKS[rawBook] || rawBook;
    if (!BOOK_SLUGS[book]) return false;
    enhanceChitasPostPage(book, range).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

async function enhanceChitasPostPage(book, range) {
  ensureCommentaryStyle();
  const bookName = book.charAt(0).toUpperCase() + book.slice(1);
  const startRef = `${bookName} ${range.startChapter}:${range.startVerse}`;
  const endRef = `${bookName} ${range.endChapter}:${range.endVerse}`;

  const realPost = await waitForElement(() => document.getElementById('realPost'), 15000);
  if (!realPost) return;
  const verseRefs = await verseRefsForRange(startRef, endRef);
  if (!verseRefs.length) return;

  let active = getStoredCommentator();
  let byRef = new Map();

  async function load(name) {
    const grouped = await commentaryForRange(name, startRef, endRef);
    byRef = new Map(grouped.map(g => [verseKey(g.ref), g.comments]));
  }

  function chunkVerseRef(chunk) {
    // Client chunks: .scroll-chunk[data-chunk-id] (0-based section order).
    // Server initial article: .awtsmoos-initial-unit[data-unit] (1-based).
    if (chunk.hasAttribute('data-chunk-id')) {
      return verseRefs[Number(chunk.dataset.chunkId)] || '';
    }
    if (chunk.hasAttribute('data-unit')) {
      return verseRefs[Number(chunk.dataset.unit) - 1] || '';
    }
    return '';
  }

  function inject() {
    const chunks = realPost.querySelectorAll(
      '.scroll-chunk[data-chunk-id], .awtsmoos-initial-unit[data-unit]'
    );
    for (const chunk of chunks) {
      if (chunk.querySelector(':scope > .chitas-post-commentary')) continue;
      const ref = verseKey(chunkVerseRef(chunk));
      if (!ref) continue;
      const comments = byRef.get(ref);
      if (!comments || !comments.length) continue;
      chunk.appendChild(buildCommentaryBlock(active, comments, 'chitas-post-commentary'));
    }
  }

  let toggleEl = null;
  async function refresh(name) {
    active = name;
    setStoredCommentator(name);
    if (toggleEl && typeof toggleEl.update === 'function') toggleEl.update(name);
    realPost.querySelectorAll('.chitas-post-commentary').forEach(n => n.remove());
    try { await load(name); } catch { /* keep verses bare */ }
    inject();
  }

  toggleEl = createCommentatorToggle(active, (name) => { refresh(name); });
  const bar = el('div', 'chitas-post-commentary-bar');
  bar.append(toggleEl);

  const deck = await waitForElement(
    () => document.querySelector('.chitas-reader-control-deck'), 10000
  );
  if (deck) deck.appendChild(bar);
  else realPost.prepend(bar);

  try { await load(active); } catch { /* keep verses bare */ }
  inject();

  // Late-rendered chunks (virtual scroll) get commentary as they arrive.
  const obs = new MutationObserver(() => { try { inject(); } catch { /* ignore */ } });
  try {
    obs.observe(realPost, { childList: true, subtree: true });
    setTimeout(() => { try { obs.disconnect(); } catch { /* ignore */ } }, 45000);
  } catch { /* ignore */ }
}
