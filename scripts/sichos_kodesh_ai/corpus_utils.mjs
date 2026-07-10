// B"H
/** Shared corpus extraction and chunking helpers. */
import fs from 'fs';
import { SOURCE, extractFootnotes, isStructuralMarker } from './sample_picker.mjs';

const JUNK = /^(?:j|hj|error|delete)$/i;

export function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export function loadCorpus() {
  return JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
}

export function meaningfulSubsections(section) {
  return (section?.subsections || []).map((item, position) => {
    const text = cleanText(item?.text);
    const sourceIndex = Number.isInteger(item?.index) ? item.index : position;
    return { sourceSubsectionIndex: sourceIndex, text, footnotes: extractFootnotes(text) };
  }).filter(item => item.text && !isStructuralMarker(item.text) && !JUNK.test(item.text));
}

export function extractDocument(documentId, doc) {
  const fields = doc?.fields || {};
  const parsed = Array.isArray(fields.parsedMainText) ? fields.parsedMainText : [];
  const sections = parsed.map((section, position) => {
    const sourceIndex = Number.isInteger(section?.index) ? section.index : position;
    return {
      sectionIndex: sourceIndex,
      sourceIndex,
      paragraphs: meaningfulSubsections(section).map(item => ({
        paragraphIndex: item.sourceSubsectionIndex,
        sourceSubsectionIndex: item.sourceSubsectionIndex,
        text: item.text,
        footnotes: item.footnotes
      }))
    };
  }).filter(section => section.paragraphs.length);
  const all = sections.flatMap(section => section.paragraphs);
  return {
    documentId,
    sourcePath: doc?.path || '',
    title: cleanText(fields.title),
    sections,
    rawSectionCount: parsed.length,
    meaningfulSectionCount: sections.length,
    meaningfulSubsectionCount: all.length,
    chars: [...all.map(item => item.text).join(' ')].length,
    footnoteCount: all.reduce((sum, item) => sum + item.footnotes.length, 0)
  };
}

export function classifyDocument(documentId, doc) {
  const extracted = extractDocument(documentId, doc);
  const raw = doc?.fields?.parsedMainText;
  let reason = '';
  if (!Array.isArray(raw)) reason = 'missing_parsedMainText';
  else if (!raw.length) reason = 'empty_parsedMainText';
  else if (!extracted.meaningfulSubsectionCount) reason = 'junk_or_no_meaningful_text';
  return { ...extracted, eligible: !reason, reason };
}

function sectionChars(section) {
  return [...section.paragraphs.map(item => item.text).join(' ')].length;
}

export function chunkDocument(document, maxChars = 12000) {
  if (!Number.isFinite(maxChars) || maxChars < 1) throw new Error('maxChars must be a positive number');
  const chunks = [];
  let current = [];
  let chars = 0;
  for (const section of document.sections) {
    const size = sectionChars(section);
    if (current.length && chars + size > maxChars) {
      chunks.push({ ...document, sections: current, combinedChars: chars });
      current = [];
      chars = 0;
    }
    current.push(section);
    chars += size;
  }
  if (current.length) chunks.push({ ...document, sections: current, combinedChars: chars });
  return chunks.map((chunk, index) => ({
    ...chunk,
    chunkIndex: index,
    chunkCount: chunks.length,
    exceedsTarget: chunk.combinedChars > maxChars
  }));
}
