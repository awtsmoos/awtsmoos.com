// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chitas-daily-study.js
 * @description
 * Renders the full Daily Chitas study: today's Hebrew + secular date,
 * Chumash (day's aliyah), Tanya (day's portion), Tehillim (monthly cycle),
 * and Rambam (3-chapter + 1-chapter tracks). Israel/Diaspora toggle with
 * auto-detect.
 *
 * Every card shows real study text in BOTH Hebrew and English: the section
 * renders immediately with references, then hydrates bilingual verse excerpts
 * (first verses of the day's portion) as the small chapter files load.
 */

import { resolveIsraelMode, setStoredIsraelMode, getStoredIsraelMode, detectIsraelByTimezone } from '../../../chitas/israel-mode.js';
import { versesForRange, psalmPreview } from '../../../chitas/verses.js';
import {
  commentaryMapForVerses,
  getStoredCommentator,
  setStoredCommentator,
  createCommentatorToggle,
  buildCommentaryBlock,
  verseKey,
} from '../../../chitas/commentary.js';

/**
 * Number -> Hebrew numeral (e.g. 25 -> כ״ה), with proper geresh/gershayim.
 */
function hebrewNumeral(n) {
  if (typeof n !== 'number' || n < 1 || n > 999) return '';
  if (n === 15) return 'ט״ו';
  if (n === 16) return 'ט״ז';
  const vals = [[400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'], [90, 'צ'], [80, 'פ'], [70, 'ע'], [60, 'ס'], [50, 'נ'], [40, 'מ'], [30, 'ל'], [20, 'כ'], [10, 'י'], [9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'], [3, 'ג'], [2, 'ב'], [1, 'א']];
  let out = '';
  let rest = n;
  for (const [v, ch] of vals) {
    while (rest >= v) { out += ch; rest -= v; }
  }
  if (out.length === 1) return out + '׳';
  return out.slice(0, -1) + '״' + out.slice(-1);
}

/**
 * Builds a fully-Hebrew portion title from structured portion metadata,
 * e.g. "אגרת הקודש, אמצע אגרת כ״ה". Never mixes English into the Hebrew line.
 */
function portionTitleHe(p) {
  if (!p) return '';
  const seferHe = p.seferHe || '';
  const num = hebrewNumeral(p.unit);
  const continued = /\(continued\)/i.test(p.title || '') ? ' (המשך)' : '';
  const partHe = { beginning: 'תחילת', middle: 'אמצע', end: 'סוף' }[p.portion] || '';
  const unitWord = p.unitType === 'epistle' ? 'אגרת' : 'פרק';
  const unitPart = ([partHe, unitWord, num].filter(Boolean).join(' ') + continued).trim();
  return [seferHe, unitPart].filter(Boolean).join(', ');
}

const TANYA_SERIES_FOR_PREFIX = {
  'la': 'tanyaLikkuteiAmarim',
  'sh': 'tanyaShaarHaYichud',
  'it': 'tanyaIgeresHaTeshuvah',
  'ka': 'tanyaKuntresAcharon',
};

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
 * Hint text for the Israel/Diaspora toggle. Always names the EFFECTIVE mode
 * and its source (shared link > saved choice > auto-detect) so the hint can
 * never contradict the active pill.
 */
function israelModeHint(currentIsrael) {
  const mode = currentIsrael ? 'Israel' : 'Diaspora';
  try {
    const param = new URLSearchParams(location.search).get('chitasIsrael');
    if (param === '1' || param === '0') {
      return `Schedule: ${mode} (set by shared link)`;
    }
  } catch { /* ignore */ }
  const stored = getStoredIsraelMode();
  if (stored !== null) {
    return `Schedule: ${mode} (your saved choice)`;
  }
  const auto = detectIsraelByTimezone();
  return `Auto-detected: ${auto ? 'Israel' : 'Diaspora'} (by timezone)`;
}

/**
 * B"H (2026-10-13, Yaakov law): text-size control for the Daily Chitas page.
 * Adjusts ONE css variable (--chitas-base-size) on the study section.
 * Hebrew derives via calc(var(--chitas-base-size) * var(--hebrew-optical))
 * and English uses var(--chitas-base-size) directly, so the Aa +/− buttons
 * scale both together and they always LOOK equal. Persisted per-device.
 * @param {HTMLElement} section The .chitas-daily-study root.
 * @returns {HTMLElement} The control bar element.
 */
const CHITAS_SIZE_KEY = 'chitasBaseSize';
const CHITAS_SIZE_MIN = 0.8;
const CHITAS_SIZE_MAX = 1.6;
const CHITAS_SIZE_STEP = 0.1;

function createChitasSizeControl(section) {
  const bar = el('div', 'chitas-size-control');
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Text size');

  const dec = el('button', 'chitas-size-btn', '−');
  dec.type = 'button';
  dec.setAttribute('aria-label', 'Decrease text size');
  const label = el('span', 'chitas-size-aa', 'Aa');
  label.setAttribute('aria-hidden', 'true');
  const inc = el('button', 'chitas-size-btn', '+');
  inc.type = 'button';
  inc.setAttribute('aria-label', 'Increase text size');

  function currentSize() {
    const raw = parseFloat(
      getComputedStyle(section).getPropertyValue('--chitas-base-size')
    );
    return Number.isFinite(raw) ? raw : 1;
  }
  function applySize(v) {
    const clamped = Math.min(CHITAS_SIZE_MAX, Math.max(CHITAS_SIZE_MIN, v));
    const rounded = Math.round(clamped * 100) / 100;
    section.style.setProperty('--chitas-base-size', `${rounded}rem`);
    try { localStorage.setItem(CHITAS_SIZE_KEY, String(rounded)); } catch {}
  }
  dec.addEventListener('click', () => applySize(currentSize() - CHITAS_SIZE_STEP));
  inc.addEventListener('click', () => applySize(currentSize() + CHITAS_SIZE_STEP));

  // Restore the user's saved size, if any.
  try {
    const saved = parseFloat(localStorage.getItem(CHITAS_SIZE_KEY));
    if (Number.isFinite(saved)) applySize(saved);
  } catch {}

  bar.append(dec, label, inc);
  return bar;
}

function createIsraelToggle(currentIsrael, onChange) {
  const wrap = el('div', 'chitas-israel-toggle');
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', 'Study schedule region');
  const label = el('span', 'chitas-israel-label', 'Schedule:');
  const btnIL = el('button', `chitas-israel-btn${currentIsrael ? ' is-active' : ''}`, 'Israel');
  const btnDI = el('button', `chitas-israel-btn${!currentIsrael ? ' is-active' : ''}`, 'Diaspora');
  btnIL.type = btnDI.type = 'button';
  btnIL.setAttribute('aria-pressed', currentIsrael ? 'true' : 'false');
  btnDI.setAttribute('aria-pressed', !currentIsrael ? 'true' : 'false');

  // Hint names the EFFECTIVE mode and where it came from, so the pill and
  // the hint can never disagree: link param > saved choice > auto-detect.
  const hint = el('span', 'chitas-israel-hint', israelModeHint(currentIsrael));

  btnIL.addEventListener('click', () => {
    setStoredIsraelMode(true);
    onChange(true);
  });
  btnDI.addEventListener('click', () => {
    setStoredIsraelMode(false);
    onChange(false);
  });

  wrap.append(label, btnIL, btnDI, hint);
  return wrap;
}

function createStudyCard(title, titleHe) {
  const card = el('article', 'chitas-daily-card');
  const header = el('div', 'chitas-daily-card-header');
  header.append(el('h3', 'chitas-daily-card-title', title));
  if (titleHe) header.append(heEl('h3', 'chitas-daily-card-title-he', titleHe));
  card.append(header);
  const textWrap = el('div', 'chitas-daily-card-text');
  card.append(textWrap);
  return { card, textWrap };
}

function appendRef(card, text, textHe) {
  if (text) card.textWrap.append(el('p', 'chitas-daily-card-ref', text));
  if (textHe) card.textWrap.append(heEl('p', 'chitas-daily-card-ref-he', textHe));
}

function appendLoading(card) {
  const loading = el('p', 'chitas-daily-card-loading', 'Loading text… · טוען טקסט…');
  loading.setAttribute('aria-live', 'polite');
  card.textWrap.append(loading);
  return loading;
}

function appendVerses(card, verses) {
  for (const v of verses) {
    const vEl = el('div', 'chitas-verse');
    if (v.he) vEl.append(heEl('p', 'chitas-verse-he', v.he));
    if (v.en) vEl.append(el('p', 'chitas-verse-en', v.en));
    card.textWrap.append(vEl);
  }
}

/**
 * Renders each preview verse with its commentary underneath (verse → Rashi
 * by default). The commentator toggle switches Rashi / Ramban / Ibn Ezra and
 * persists the choice in localStorage.
 */
async function appendChumashCommentary(card, c, verses) {
  const startParsed = String(c.start || '').match(/^(\w+)\s+(\d+):(\d+)/);
  const book = startParsed ? startParsed[1].toLowerCase() : '';
  const block = el('div', 'chitas-chumash-commentary');
  const toggle = createCommentatorToggle(getStoredCommentator(), (name) => {
    setStoredCommentator(name);
    show(name);
  });
  const groups = el('div', 'chitas-verse-groups');
  block.append(toggle, groups);
  card.textWrap.append(block);

  async function show(name) {
    groups.innerHTML = '';
    const loading = el('p', 'chitas-commentary-loading', 'Loading commentary… · טוען פירוש…');
    loading.setAttribute('aria-live', 'polite');
    groups.append(loading);
    let byRef = new Map();
    try {
      byRef = await commentaryMapForVerses(name, book, verses.map(v => v.ref));
    } catch { /* verses stay bare */ }
    loading.remove();
    for (const v of verses) {
      const group = el('div', 'chitas-verse-group');
      const vEl = el('div', 'chitas-verse');
      if (v.he) vEl.append(heEl('p', 'chitas-verse-he', v.he));
      if (v.en) vEl.append(el('p', 'chitas-verse-en', v.en));
      group.append(vEl);
      const comments = byRef.get(verseKey(v.ref));
      if (comments && comments.length) group.append(buildCommentaryBlock(name, comments));
      groups.append(group);
    }
  }

  await show(getStoredCommentator());
}

function chitasDateKey(studyDate) {
  const y = studyDate.getFullYear();
  const m = String(studyDate.getMonth() + 1).padStart(2, '0');
  const d = String(studyDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Link to the full virtual post page (all aliyah verses + commentary).
 * Uses the heichel the card lives in — the same one the day rows link with.
 */
function chumashPostHref(studyDate, heichelId) {
  const dateKey = chitasDateKey(studyDate);
  let h = heichelId;
  if (!h) {
    try {
      const m = location.pathname.match(/\/heichelos\/([^/]+)/);
      h = m ? decodeURIComponent(m[1]) : 'ikar';
    } catch { h = 'ikar'; }
  }
  const params = new URLSearchParams();
  params.set('chitasDate', dateKey);
  return `/heichelos/${encodeURIComponent(h)}/series/daily-chitas/post/chitas-${dateKey}?${params}`;
}

function appendLink(card, href, text) {
  const a = el('a', 'chitas-daily-card-link', text);
  a.href = href;
  card.textWrap.append(a);
}

function tanyaSeriesForPostId(postId) {
  const m = String(postId).match(/tanya-he-([a-z]+)-/);
  return TANYA_SERIES_FOR_PREFIX[m?.[1]] || 'tanyaLikkuteiAmarim';
}

function stripVilnaMarkers(text) {
  return String(text || '').replace(/\[וילנא:[^\]]+\]/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

function truncate(text, max) {
  const t = String(text || '').trim();
  if (t.length <= max) return t;
  const cut = t.lastIndexOf(' ', max);
  return t.slice(0, cut > 0 ? cut : max).trim() + '…';
}

async function fetchTanyaExcerpt(postId) {
  const seriesId = tanyaSeriesForPostId(postId);
  const url = `/api/social/heichelos/ikar/series/${encodeURIComponent(seriesId)}/post/${encodeURIComponent(postId)}`;
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) return null;
  const post = await res.json();
  const units = Array.isArray(post.units) ? post.units : [];
  const first = units.find(u => (u.he || u.english));
  if (!first) return null;
  return {
    he: truncate(stripVilnaMarkers(first.he), 600),
    en: truncate(first.english, 600),
    title: post.title || '',
    heTitle: post.heTitle || '',
  };
}

function reloadWithIsrael(israel) {
  const params = new URLSearchParams(location.search);
  params.set('chitasIsrael', israel ? '1' : '0');
  location.href = `${location.pathname}?${params}`;
}

/**
 * First bilingual unit of a Rambam chapter post. Rambam posts carry full
 * Hebrew + English translations in `hebrew`/`english` unit fields.
 * Returns null when the post (or its text) is unavailable.
 */
async function fetchRambamExcerpt(seriesId, postId) {
  const url = `/api/social/heichelos/rambam/series/${encodeURIComponent(seriesId)}/post/${encodeURIComponent(postId)}`;
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) return null;
  const post = await res.json();
  const units = Array.isArray(post.units) ? post.units : [];
  const first = units.find(u => (u.hebrew || u.english));
  if (!first) return null;
  return {
    he: truncate(stripVilnaMarkers(first.hebrew), 600),
    en: truncate(first.english, 600),
  };
}

/**
 * Fills each card with bilingual text after the shell renders.
 */
async function hydrateCardTexts(dailyStudy, cards, studyDate, heichelId) {
  // 1. Chumash — first verses of the day's aliyah, each with Rashi (default)
  //    commentary underneath and a commentator toggle.
  if (cards.chumash && dailyStudy.chumash) {
    const c = dailyStudy.chumash;
    try {
      const verses = await versesForRange(c.start, c.end, 3);
      cards.chumash.loading?.remove();
      if (verses.length) await appendChumashCommentary(cards.chumash, c, verses);
      appendLink(cards.chumash, chumashPostHref(studyDate, heichelId), 'Open Chumash →');
    } catch (e) {
      cards.chumash.loading?.remove();
    }
  }
  // 2. Tanya — bilingual excerpt from the day's post.
  if (cards.tanya && dailyStudy.tanya) {
    const t = dailyStudy.tanya;
    try {
      if (t.postIds.length > 0) {
        const excerpt = await fetchTanyaExcerpt(t.postIds[0]);
        cards.tanya.loading?.remove();
        if (excerpt) {
          if (excerpt.heTitle) cards.tanya.textWrap.append(heEl('p', 'chitas-daily-card-subtitle-he', excerpt.heTitle));
          if (excerpt.title) cards.tanya.textWrap.append(el('p', 'chitas-daily-card-subtitle', excerpt.title));
          appendVerses(cards.tanya, [{ he: excerpt.he, en: excerpt.en }]);
          const postId = t.postIds[0];
          appendLink(cards.tanya,
            `/heichelos/ikar/series/${tanyaSeriesForPostId(postId)}/post/${postId}`,
            'Open Tanya →');
        }
      } else if (t.portion) {
        // Igeres HaKodesh portions: posts not yet imported — show the
        // bilingual portion reference. English title already contains the
        // sefer name (no duplication); Hebrew line is built fully in Hebrew.
        cards.tanya.loading?.remove();
        const p = t.portion;
        const heTitle = portionTitleHe(p);
        if (heTitle) {
          cards.tanya.textWrap.append(heEl('p', 'chitas-daily-card-subtitle-he', heTitle));
        }
        if (p.title) {
          cards.tanya.textWrap.append(el('p', 'chitas-daily-card-subtitle', p.title));
        }
        cards.tanya.textWrap.append(el('p', 'chitas-daily-card-note',
          'Full text coming soon.'));
        cards.tanya.textWrap.append(heEl('p', 'chitas-daily-card-note-he',
          'הטקסט המלא יעלה בקרוב.'));
      }
    } catch (e) {
      cards.tanya.loading?.remove();
    }
  }
  // 3. Tehillim — first verses of the day's first chapter.
  if (cards.tehillim && dailyStudy.tehillim) {
    const th = dailyStudy.tehillim;
    try {
      const verses = await psalmPreview(th.start, 3);
      cards.tehillim.loading?.remove();
      if (verses.length) appendVerses(cards.tehillim, verses);
      if (th.postIds.length > 0) {
        appendLink(cards.tehillim,
          `/heichelos/ikar/series/tehillim/post/${th.postIds[0]}`,
          'Open Tehillim →');
      }
    } catch (e) {
      cards.tehillim.loading?.remove();
    }
  }
  // 4. Rambam — both tracks, each with a bilingual excerpt + chapter link.
  if (cards.rambam && dailyStudy.rambam) {
    const r = dailyStudy.rambam;
    try {
      cards.rambam.loading?.remove();
      if (r.track3) await hydrateRambamTrack(cards.rambam, r.track3, false);
      if (r.track1) {
        const divider = el('div', 'chitas-daily-track-divider');
        divider.setAttribute('aria-hidden', 'true');
        cards.rambam.textWrap.append(divider);
        await hydrateRambamTrack(cards.rambam, r.track1, true);
      }
    } catch (e) {
      cards.rambam.loading?.remove();
    }
  }
}

/**
 * Fills one Rambam track (3-chapter or 1-chapter) inside the Rambam card:
 * track header, bilingual portion label, excerpt of the first chapter,
 * and an "Open Rambam →" link to that chapter post.
 */
async function hydrateRambamTrack(card, track, isSingle) {
  const dayHe = hebrewNumeral(track.dayOfCycle);
  const cycleHe = hebrewNumeral(track.cycle);
  const trackEn = isSingle ? '1 Chapter a Day' : '3 Chapters a Day';
  const trackHe = isSingle ? 'פרק אחד ליום' : 'שלושה פרקים ליום';
  appendRef(card,
    `${trackEn} · Day ${track.dayOfCycle} of ${track.cycleLen} · Cycle ${track.cycle}`,
    `${trackHe} · יום ${dayHe} מתוך ${track.cycleLen} · מחזור ${cycleHe}`);
  card.textWrap.append(el('p', 'chitas-daily-card-subtitle', track.label));
  card.textWrap.append(heEl('p', 'chitas-daily-card-subtitle-he', track.labelHe));
  const first = isSingle ? track.reading : track.readings[0];
  if (first && first.postId && first.seriesId) {
    try {
      const excerpt = await fetchRambamExcerpt(first.seriesId, first.postId);
      if (excerpt && (excerpt.he || excerpt.en)) {
        appendVerses(card, [{ he: excerpt.he, en: excerpt.en }]);
      }
    } catch (e) { /* excerpt stays empty; label + link still show */ }
    if (first.url) appendLink(card, first.url, 'Open Rambam →');
  }
}

/**
 * Renders the full daily study section.
 * @param {object} dailyStudy The dailyStudy object from virtual-series.
 * @param {Date} studyDate The selected date.
 * @param {string} heichelId The heichel hosting the study (for post links).
 * @returns {HTMLElement}
 */
export function createDailyStudySection(dailyStudy, studyDate, heichelId) {
  const section = el('section', 'chitas-daily-study');
  section.setAttribute('aria-label', 'Daily Chitas Study');

  // Date header
  const header = el('header', 'chitas-daily-date-header');
  const dateEn = studyDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  header.append(el('h2', 'chitas-daily-date-en', dateEn));
  header.append(heEl('p', 'chitas-daily-date-he', dailyStudy.hebrewDate));
  header.append(el('p', 'chitas-daily-date-he-en', dailyStudy.hebrewDateEn));
  section.append(header);

  // B"H (2026-10-13, Yaakov law): text-size controls. One variable —
  // --chitas-base-size — drives BOTH Hebrew (×1.3 optical) and English,
  // so they always scale together and always LOOK equal.
  section.append(createChitasSizeControl(section));

  // Israel toggle
  section.append(createIsraelToggle(dailyStudy.israel, reloadWithIsrael));

  // Three study cards
  const grid = el('div', 'chitas-daily-grid');
  const cards = {};

  // 1. Chumash
  if (dailyStudy.chumash) {
    const c = dailyStudy.chumash;
    const built = createStudyCard('Chumash', 'חומש');
    appendRef(built,
      `${c.parshaEn} · Aliyah ${c.n} (${c.en})`,
      `${c.parshaHe} · עליה ${c.he}`);
    built.textWrap.append(el('p', 'chitas-daily-card-verses', `${c.start} – ${c.end}`));
    built.loading = appendLoading(built);
    cards.chumash = built;
    grid.append(built.card);
  }

  // 2. Tanya
  if (dailyStudy.tanya) {
    const t = dailyStudy.tanya;
    const built = createStudyCard('Tanya', 'תניא');
    const count = t.postIds.length;
    const cycleHe = t.leap ? 'שנה מעוברת' : 'שנה פשוטה';
    if (count > 0) {
      appendRef(built,
        `${count} section${count > 1 ? 's' : ''} · ${t.cycle}`,
        `${hebrewNumeral(count)} ${count > 1 ? 'חלקים' : 'חלק'} · ${cycleHe}`);
    } else if (t.portion) {
      appendRef(built, t.cycle, cycleHe);
    }
    built.loading = appendLoading(built);
    cards.tanya = built;
    grid.append(built.card);
  }

  // 3. Tehillim
  if (dailyStudy.tehillim) {
    const th = dailyStudy.tehillim;
    const built = createStudyCard('Tehillim', 'תהלים');
    appendRef(built, th.label, th.labelHe);
    built.loading = appendLoading(built);
    cards.tehillim = built;
    grid.append(built.card);
  }

  // 4. Rambam — both daily tracks (3 chapters + 1 chapter).
  if (dailyStudy.rambam) {
    const built = createStudyCard('Rambam', 'רמב״ם');
    built.loading = appendLoading(built);
    cards.rambam = built;
    grid.append(built.card);
  }

  section.append(grid);

  // Fill in bilingual text asynchronously — the shell stays fast.
  hydrateCardTexts(dailyStudy, cards, studyDate, heichelId).catch(() => {});

  return section;
}
