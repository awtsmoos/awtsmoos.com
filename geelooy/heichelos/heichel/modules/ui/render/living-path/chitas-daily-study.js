// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chitas-daily-study.js
 * @description
 * Renders the full Daily Chitas study: today's Hebrew + secular date,
 * Chumash (day's aliyah), Tanya (day's portion), and Tehillim (monthly cycle).
 * Israel/Diaspora toggle with auto-detect.
 */

import { resolveIsraelMode, setStoredIsraelMode, detectIsraelByTimezone } from '../../../chitas/israel-mode.js';

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

function createIsraelToggle(currentIsrael, onChange) {
  const wrap = el('div', 'chitas-israel-toggle');
  const label = el('span', 'chitas-israel-label', 'Schedule:');
  const btnIL = el('button', `chitas-israel-btn${currentIsrael ? ' is-active' : ''}`, 'Israel');
  const btnDI = el('button', `chitas-israel-btn${!currentIsrael ? ' is-active' : ''}`, 'Diaspora');
  btnIL.type = btnDI.type = 'button';
  
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

function createStudyCard(title, titleHe, body, bodyHe, link, linkText) {
  const card = el('article', 'chitas-daily-card');
  const header = el('div', 'chitas-daily-card-header');
  header.append(el('h3', 'chitas-daily-card-title', title));
  if (titleHe) {
    const he = el('h3', 'chitas-daily-card-title-he', titleHe);
    he.dir = 'rtl';
    he.lang = 'he';
    header.append(he);
  }
  card.append(header);
  
  if (body) {
    const bodyEl = el('div', 'chitas-daily-card-body', body);
    card.append(bodyEl);
  }
  if (bodyHe) {
    const bodyHeEl = el('div', 'chitas-daily-card-body-he', bodyHe);
    bodyHeEl.dir = 'rtl';
    bodyHeEl.lang = 'he';
    card.append(bodyHeEl);
  }
  if (link) {
    const a = el('a', 'chitas-daily-card-link', linkText || 'Open →');
    a.href = link;
    card.append(a);
  }
  return card;
}

function reloadWithIsrael(israel) {
  const params = new URLSearchParams(location.search);
  params.set('chitasIsrael', israel ? '1' : '0');
  // Keep other params
  location.href = `${location.pathname}?${params}`;
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
  header.append(el('p', 'chitas-daily-date-he', dailyStudy.hebrewDate));
  const heEn = el('p', 'chitas-daily-date-he-en', dailyStudy.hebrewDateEn);
  header.append(heEn);
  section.append(header);
  
  // Israel toggle
  section.append(createIsraelToggle(dailyStudy.israel, reloadWithIsrael));
  
  // Three study cards
  const grid = el('div', 'chitas-daily-grid');
  
  // 1. Chumash
  if (dailyStudy.chumash) {
    const c = dailyStudy.chumash;
    const body = `${c.parshaEn} · Aliyah ${c.n} (${c.en})`;
    const bodyHe = `${c.parshaHe} · עליה ${c.he}`;
    const verses = `${c.start} – ${c.end}`;
    grid.append(createStudyCard(
      'Chumash', 'חומש',
      `${body}\n${verses}`, `${bodyHe}\n${c.start} – ${c.end}`,
      null, null
    ));
  }
  
  // 2. Tanya
  if (dailyStudy.tanya) {
    const t = dailyStudy.tanya;
    const count = t.postIds.length;
    let body, bodyHe = null, link = null, linkText = null;
    if (count > 0) {
      body = `${count} section${count > 1 ? 's' : ''} · ${t.cycle}`;
      // Link to the first Tanya post (they're in tanyaLikkuteiAmarim etc.)
      // Use the post ID directly via the series
      const postId = t.postIds[0];
      const seriesId = postId.includes('la-') ? 'tanyaLikkuteiAmarim'
        : postId.includes('sh-') ? 'tanyaShaarHaYichud'
        : postId.includes('it-') ? 'tanyaIgeresHaTeshuvah'
        : 'tanyaKuntresAcharon';
      link = `/heichelos/ikar/series/${seriesId}/post/${postId}`;
      linkText = 'Open Tanya →';
    } else {
      body = 'No Tanya portion assigned for this date in the traditional cycle.';
      bodyHe = 'אין שיעור תניא קבוע לתאריך זה';
    }
    grid.append(createStudyCard('Tanya', 'תניא', body, bodyHe, link, linkText));
  }
  
  // 3. Tehillim
  if (dailyStudy.tehillim) {
    const th = dailyStudy.tehillim;
    const link = th.postIds.length > 0
      ? `/heichelos/ikar/series/tehillim/post/${th.postIds[0]}`
      : null;
    grid.append(createStudyCard(
      'Tehillim', 'תהלים',
      th.label, th.labelHe,
      link, link ? 'Open Tehillim →' : null
    ));
  }
  
  section.append(grid);
  return section;
}
