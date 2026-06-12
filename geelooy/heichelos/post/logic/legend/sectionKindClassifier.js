// B"H
/**
 * @file sectionKindClassifier.js
 * @description
 * Chapter 343 rewritten: section kinds are marked conservatively. The Awtsmoos
 * knows the true meaning of every letter; this browser vessel must not pretend
 * a tiny regex is prophecy. Existing metadata wins. Heuristics are labeled.
 */

const KIND_VALUES = new Set(['question', 'story', 'commentary', 'teaching']);

function cleanKind(value) {
  const kind = String(value || '').trim().toLowerCase();
  return KIND_VALUES.has(kind) ? kind : '';
}

function attr(section, name) {
  return typeof section.getAttribute === 'function' ? section.getAttribute(name) : '';
}

function kindFromMetadata(section) {
  return cleanKind(
    section.dataset?.awtsmoosKind ||
    section.dataset?.sectionKind ||
    attr(section, 'data-kind') ||
    attr(section, 'role-kind')
  );
}

function kindFromText(text) {
  const value = String(text || '').trim();
  if (!value) return '';
  if (/\?$/.test(value) || value.includes('?')) return 'question';
  if (/פירוש|ביאור|commentary|explanation/i.test(value)) return 'commentary';
  if (/\b(מעשה|ויאמר|וידבר|אמר)\b/.test(value)) return 'story';
  return 'teaching';
}

function ensureDataset(section) {
  if (!section.dataset) section.dataset = {};
  return section.dataset;
}

function markSection(section) {
  const dataset = ensureDataset(section);
  const existing = kindFromMetadata(section);
  if (existing) {
    dataset.awtsmoosKind = existing;
    if (!dataset.awtsmoosKindSource) dataset.awtsmoosKindSource = 'metadata';
    return existing;
  }

  const guessed = kindFromText(section.textContent);
  if (!guessed) return '';
  dataset.awtsmoosKind = guessed;
  dataset.awtsmoosKindSource = 'heuristic';
  return guessed;
}

/**
 * Fill empty section-kind vessels without overriding existing metadata.
 * @param {ParentNode} root
 * @returns {number} section count
 */
export function classifySectionKinds(root = document) {
  const sections = [...root.querySelectorAll('#realPost .section')];
  sections.forEach(markSection);
  return sections.length;
}

export const __testing = { cleanKind, kindFromText };
