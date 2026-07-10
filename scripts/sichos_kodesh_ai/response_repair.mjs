// B"H
/** Recover existing English while discarding footnote tags only. */
import { parseSichosXml, stripFences } from './parse_xml.mjs';
import { stripSupTags, validateForJob } from './translation_policy.mjs';

function indexedBlocks(text, tag) {
  const regex = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const map = new Map();
  const duplicates = new Set();
  for (const match of String(text).matchAll(regex)) {
    const index = match[1].match(/\bindex\s*=\s*["'](\d+)["']/i)?.[1];
    if (index == null) continue;
    const number = Number(index);
    if (map.has(number)) duplicates.add(number);
    else map.set(number, match[0]);
  }
  return { map, duplicates };
}

function rootCandidate(text) {
  const clean = stripFences(text);
  const start = clean.indexOf('<translation');
  const end = clean.lastIndexOf('</translation>');
  if (start >= 0 && end > start) return clean.slice(start, end + 14);
  return clean;
}

function check(chunk, xml, method) {
  try {
    const cleaned = stripSupTags(xml);
    const parsed = parseSichosXml(cleaned);
    const validation = validateForJob(chunk, parsed);
    return validation.ok
      ? { ok: true, xml: cleaned, parsed, validation, method }
      : { ok: false, reason: 'validation_failed', errors: validation.errors };
  } catch (error) {
    return { ok: false, reason: 'parse_failed', error: error.message };
  }
}

export function recoverExactChunk(chunk, responseText) {
  const root = rootCandidate(responseText);
  const exact = check(chunk, root, 'footnote_free_exact');
  if (exact.ok) return exact;
  const blocks = indexedBlocks(root, 'v');
  if (blocks.duplicates.size) return { ok: false, reason: 'duplicate_v_indices' };
  const expected = chunk.sections.map(section => section.sectionIndex);
  if (!expected.every(index => blocks.map.has(index))) return exact;
  const sliced = `<translation>\n${expected.map(index => blocks.map.get(index)).join('\n')}\n</translation>`;
  return check(chunk, sliced, 'footnote_free_indexed_v_slice');
}

export function conciseFailure(error, limit = 8) {
  return String(error?.message || error || '').split('\n').filter(Boolean).slice(0, limit).join('\n');
}
