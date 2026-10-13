// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ChitasVerses
 * @description
 * Bilingual (Hebrew + English) verse text for the Daily Chitas cards.
 * Verse data lives in small per-chapter JSON files under ./verses/<book>/<ch>.json,
 * generated from the flat Tanach base (verse-level Hebrew + English).
 * Files are fetched on demand and cached in memory.
 */

const BOOK_SLUGS = {
  'genesis': 'genesis',
  'exodus': 'exodus',
  'leviticus': 'leviticus',
  'numbers': 'numbers',
  'deuteronomy': 'deuteronomy',
  'psalms': 'psalms',
};

const chapterCache = new Map();

function verseBase() {
  // Resolves relative to this module's directory.
  try {
    const url = new URL('./verses/', import.meta.url);
    return url.href;
  } catch {
    return '/heichelos/heichel/modules/chitas/verses/';
  }
}

/**
 * Fetches all verses for a book chapter.
 * @param {string} book Book slug (genesis, exodus, leviticus, numbers, deuteronomy, psalms).
 * @param {string|number} chapter Chapter number.
 * @returns {Promise<Array<{v:string, he:string, en:string}>>}
 */
export async function fetchChapter(book, chapter) {
  const slug = BOOK_SLUGS[String(book).toLowerCase()];
  if (!slug) return [];
  const key = `${slug}/${chapter}`;
  if (chapterCache.has(key)) return chapterCache.get(key);
  try {
    const res = await fetch(`${verseBase()}${slug}/${chapter}.json`, { cache: 'force-cache' });
    if (!res.ok) return [];
    const verses = await res.json();
    chapterCache.set(key, Array.isArray(verses) ? verses : []);
    return chapterCache.get(key);
  } catch {
    return [];
  }
}

function parseRef(ref) {
  // "Genesis 7:17" -> {book:'genesis', chapter:'7', verse:'17'}
  const m = String(ref || '').match(/^(\w+)\s+(\d+):(\d+)/);
  if (!m) return null;
  const slug = BOOK_SLUGS[m[1].toLowerCase()];
  if (!slug) return null;
  return { book: slug, chapter: m[2], verse: m[3] };
}

/**
 * Returns bilingual verses for a reference range like "Genesis 7:17" -> "Genesis 8:14".
 * @param {string} startRef Start reference.
 * @param {string} endRef End reference.
 * @param {number} maxVerses Cap on returned verses (0 = no cap).
 * @returns {Promise<Array<{ref:string, he:string, en:string}>>}
 */
export async function versesForRange(startRef, endRef, maxVerses = 0) {
  const s = parseRef(startRef);
  const e = parseRef(endRef);
  if (!s || !e || s.book !== e.book) return [];
  const out = [];
  const startCh = parseInt(s.chapter, 10);
  const endCh = parseInt(e.chapter, 10);
  for (let ch = startCh; ch <= endCh; ch++) {
    const verses = await fetchChapter(s.book, String(ch));
    for (const v of verses) {
      const vn = parseInt(String(v.v).replace(/\D/g, ''), 10);
      if (ch === startCh && vn < parseInt(s.verse, 10)) continue;
      if (ch === endCh && vn > parseInt(e.verse, 10)) continue;
      out.push({ ref: `${ch}:${v.v}`, he: v.he, en: v.en });
      if (maxVerses > 0 && out.length >= maxVerses) return out;
    }
  }
  return out;
}

/**
 * Returns the first N verses of a Psalms chapter (for the Tehillim preview).
 */
export async function psalmPreview(chapter, maxVerses = 3) {
  const verses = await fetchChapter('psalms', String(chapter));
  return verses.slice(0, maxVerses).map(v => ({
    ref: `${chapter}:${v.v}`,
    he: v.he,
    en: v.en,
  }));
}
