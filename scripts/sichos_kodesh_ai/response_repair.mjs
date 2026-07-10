// B"H
/** Recover only English already present in a model response; never translate. */
import { parseSichosXml, stripFences, validateParsed } from './parse_xml.mjs';

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

export function recoverExactChunk(chunk, responseText) {
  const root = rootCandidate(responseText);
  try {
    const parsed = parseSichosXml(root);
    const validation = validateParsed(chunk, parsed);
    if (validation.ok) return { ok: true, xml: parsed.xml, parsed, validation, method: 'exact' };
  } catch {}

  const blocks = indexedBlocks(root, 'v');
  if (blocks.duplicates.size) return { ok: false, reason: 'duplicate_v_indices' };
  const expected = chunk.sections.map(section => section.sectionIndex);
  if (!expected.every(index => blocks.map.has(index))) return { ok: false, reason: 'missing_expected_v' };
  const xml = `<translation>\n${expected.map(index => blocks.map.get(index)).join('\n')}\n</translation>`;
  try {
    const parsed = parseSichosXml(xml);
    const validation = validateParsed(chunk, parsed);
    if (validation.ok) return { ok: true, xml, parsed, validation, method: 'indexed_v_slice' };
    return { ok: false, reason: 'validation_failed', errors: validation.errors };
  } catch (error) {
    return { ok: false, reason: 'parse_failed', error: error.message };
  }
}

export function conciseFailure(error, limit = 12) {
  const lines = String(error?.message || error || '').split('\n').filter(Boolean);
  return lines.slice(0, limit).join('\n');
}
