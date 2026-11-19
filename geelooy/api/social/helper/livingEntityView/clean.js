// B"H
/**
 * @module LivingEntityClean
 * @description
 * Chapter 1: Before the palace can speak, every spark is washed. The Awtsmoos
 * lets old posts, rich comments, and recursive entities enter one quiet vessel
 * without angle-bracket storms or broken arrays spilling into the reader.
 */

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decodeEntitiesOnce(raw) {
  return raw.replace(/&(amp|lt|gt|quot|apos);|&#(\d+);|&#x([0-9a-fA-F]+);/g, (match, named, dec, hex) => {
    if (named) return NAMED_ENTITIES[named];
    const code = hex ? parseInt(hex, 16) : parseInt(dec, 10);
    return Number.isFinite(code) && code > 0 && code <= 0x10FFFF ? String.fromCodePoint(code) : match;
  });
}

/**
 * B"H 2026-11-19 (social polish): decode entities once and strip whole
 * tags — the old wash deleted only "<" and ">", leaving tag names and
 * hrefs behind as visible text in entity views.
 */
function text(value, fallback = '', max = 8000) {
  return decodeEntitiesOnce(String(value ?? fallback))
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
    .trim()
    .slice(0, max);
}

function list(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'object') return Object.keys(value);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function values(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  return Object.values(value);
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = { text, list, values, number };
