// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chitas-daily-study.js
 * @description
 * Renders the full Daily Chitas study: today's Hebrew + secular date,
 * Chumash (day's aliyah), Tanya (day's portion), and Tehillim (monthly cycle).
 * Israel/Diaspora toggle with auto-detect.
 *
 * Every card shows real study text in BOTH Hebrew and English: the section
 * renders immediately with references, then hydrates bilingual verse excerpts
 * (first verses of the day's portion) as the small chapter files load.
 */

import { resolveIsraelMode, setStoredIsraelMode, detectIsraelByTimezone } from '../../../chitas/israel-mode.js';
import { versesForRange, psalmPreview } from '../../../chitas/verses.js';

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

  const auto = detectIsraelByTimezone();
  const hint = el('span', 'chitas-israel-hint',
    `Auto-detected: ${auto ? 'Israel' : 'Diaspora'} (by timezone)`);

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
  const loading = el('p', 'chitas-daily-card-loading', 'Loading text…');
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
 * Fills each card with bilingual text after the shell renders.
 */
async function hydrateCardTexts(dailyStudy, cards) {
  // 1. Chumash — first verses of the day's aliyah.
  if (cards.chumash && dailyStudy.chumash) {
    const c = dailyStudy.chumash;
    try {
      const verses = await versesForRange(c.start, c.end, 3);
      cards.chumash.loading?.remove();
      if (verses.length) appendVerses(cards.chumash, verses);
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
        // bilingual portion reference.
        cards.tanya.loading?.remove();
        const p = t.portion;
        if (p.seferHe || p.title) {
          cards.tanya.textWrap.append(heEl('p', 'chitas-daily-card-subtitle-he',
            [p.seferHe, p.title].filter(Boolean).join(' · ')));
        }
        if (p.seferEn || p.title) {
          cards.tanya.textWrap.append(el('p', 'chitas-daily-card-subtitle',
            [p.seferEn, p.title].filter(Boolean).join(' · ')));
        }
        cards.tanya.textWrap.append(el('p', 'chitas-daily-card-note',
          'Full text coming soon.'));
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
}

/**
 * Renders the full daily study section.
 * @param {object} dailyStudy The dailyStudy object from virtual-series.
 * @param {Date} studyDate The selected date.
 * @returns {HTMLElement}
 */
export function createDailyStudySection(dailyStudy, studyDate) {
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
    if (count > 0) {
      appendRef(built,
        `${count} section${count > 1 ? 's' : ''} · ${t.cycle}`,
        null);
    } else if (t.portion) {
      appendRef(built, t.cycle, null);
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

  section.append(grid);

  // Fill in bilingual text asynchronously — the shell stays fast.
  hydrateCardTexts(dailyStudy, cards).catch(() => {});

  return section;
}
