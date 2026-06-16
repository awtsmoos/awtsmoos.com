// B"H
/**
 * @file normalize_hebrew.mjs
 * @chapter The Nekudos Fall Away And The Letters Stand Like Flame
 * @description Hebrew normalization for Tanach search: tags vanish, trop and
 * niqqud are stripped, maqaf becomes space, and only Hebrew letters remain.
 */

const HEBREW_MARKS = /[\u0591-\u05BD\u05BF-\u05C7]/g;
const HTML_TAGS = /<[^>]*>/g;
const HTML_ENTITIES = /&(?:nbsp|quot|apos|amp|lt|gt|#\d+|#x[0-9a-f]+);/gi;
const NOT_HEBREW = /[^\u05D0-\u05EA]+/g;

const ENTITY_MAP = new Map([
  ["&nbsp;", " "], ["&quot;", "\""], ["&apos;", "'"],
  ["&amp;", "&"], ["&lt;", "<"], ["&gt;", ">"]
]);

export function stripHtml(value = "") {
  return String(value).replace(HTML_TAGS, " ").replace(HTML_ENTITIES, match => {
    const lower = match.toLowerCase();
    if (ENTITY_MAP.has(lower)) return ENTITY_MAP.get(lower);
    if (/^&#x/i.test(match)) return String.fromCodePoint(parseInt(match.slice(3, -1), 16));
    if (/^&#/i.test(match)) return String.fromCodePoint(parseInt(match.slice(2, -1), 10));
    return " ";
  });
}

export function normalizeHebrew(value = "") {
  return stripHtml(value)
    .normalize("NFKD")
    .replace(HEBREW_MARKS, "")
    .replace(/[־–—-]/g, " ")
    .replace(NOT_HEBREW, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeHebrew(value = "") {
  const normalized = normalizeHebrew(value);
  return normalized ? normalized.split(" ").filter(Boolean) : [];
}

export function uniqueTokens(value = "") {
  return [...new Set(tokenizeHebrew(value))];
}
