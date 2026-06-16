// B"H
/**
 * @file extract_hebrew_segments.mjs
 * @chapter Every Strange Sefarim Shape Confesses Its Hebrew Sparks
 * @description Recursively extracts Hebrew-bearing strings from arbitrary post
 * structures: Bavli snippets, Mishnah imports, Chassidus articles, Rambam, and
 * any other uneven vessel in the ikar heichel.
 */

import { hasHebrew, normalizeHebrew, previewHebrew, tokenizeHebrew } from "./normalize_hebrew.mjs";

const SKIP_KEYS = new Set(["notesEng", "textEng", "intro_eng", "summary_eng", "files"]);

function shouldSkip(key = "") {
  const clean = String(key);
  if (SKIP_KEYS.has(clean)) return true;
  return /eng|english|native/i.test(clean) && !/heb|hebrew/i.test(clean);
}

function fieldWeight(path = "") {
  if (/textHeb|hebrew|textOrig|titleHeb|content|title/i.test(path)) return 0;
  return 1;
}

export function extractHebrewSegments(value, base = {}) {
  const found = [];
  const walk = (node, parts) => {
    if (node === null || node === undefined) return;
    if (typeof node === "string") {
      if (!hasHebrew(node)) return;
      const normalized = normalizeHebrew(node);
      const tokens = [...new Set(tokenizeHebrew(normalized))];
      if (!tokens.length) return;
      found.push({
        ...base,
        segmentPath: parts.join("."),
        fieldWeight: fieldWeight(parts.join(".")),
        hebrewPreview: previewHebrew(node),
        normalizedHebrew: normalized,
        tokens
      });
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, [...parts, String(index)]));
      return;
    }
    if (typeof node === "object") {
      for (const [key, child] of Object.entries(node)) {
        if (shouldSkip(key)) continue;
        walk(child, [...parts, key]);
      }
    }
  };
  walk(value, []);
  return found.sort((a, b) => a.fieldWeight - b.fieldWeight || a.segmentPath.localeCompare(b.segmentPath));
}
