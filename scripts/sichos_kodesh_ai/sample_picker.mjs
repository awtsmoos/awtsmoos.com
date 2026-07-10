// B"H
/**
 * Sample picker for one isolated Sichos Kodesh test.
 *
 * The Awtsmoos gathers a larger but still bounded vessel, preserves every
 * numbered footnote spark, and refuses structural labels masquerading as text.
 */
import fs from 'fs';

export const SOURCE = '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-parsed/Sichos Kodesh.parsed.json';

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export function extractFootnotes(value) {
  return [...cleanText(value).matchAll(/(?<![\d\u0590-\u05FF])\d{1,3}(?![\d\u0590-\u05FF])/gu)].map(match => match[0]);
}

export function isStructuralMarker(value) {
  const text = cleanText(value).replace(/[\u200e\u200f]/g, '');
  return /^(?:[א-ת]{1,3}[.)]|(?:סעיף|אות)\s+[א-ת]{1,3})$/u.test(text);
}

function charsOf(subsections) {
  return [...subsections.map(item => item.text).join(' ')].length;
}

function subsectionsFrom(section) {
  return (section.subsections || []).map(item => ({
    sourceSubsectionIndex: item.index,
    text: cleanText(item.text),
    footnotes: extractFootnotes(item.text)
  })).filter(item => item.text && !isStructuralMarker(item.text));
}

function selectedSubsections(section, maxSubsections) {
  return subsectionsFrom(section).slice(0, maxSubsections).map((item, subsectionIndex) => ({
    paragraphIndex: subsectionIndex,
    sourceSubsectionIndex: item.sourceSubsectionIndex,
    text: item.text,
    footnotes: item.footnotes
  }));
}

function meaningfulSections(parsed, maxSubsections) {
  return parsed.map((section, sectionIndex) => ({ section, sectionIndex }))
    .filter(({ section }) => section.kind !== 'separator' && (section.subsections || []).length)
    .map(({ section, sectionIndex }) => ({
      sectionIndex,
      sourceIndex: section.index,
      paragraphs: selectedSubsections(section, maxSubsections)
    })).filter(section => section.paragraphs.length);
}

function candidateWindows(candidates, maxSections, minChars, requireFootnotes) {
  const windows = [];
  for (let start = 0; start < candidates.length; start++) {
    const window = [];
    for (let offset = 0; offset < maxSections && start + offset < candidates.length; offset++) {
      window.push(candidates[start + offset]);
      const all = window.flatMap(section => section.paragraphs);
      const hasFootnotes = all.some(item => item.footnotes.length);
      if (window.length >= 2 && charsOf(all) >= minChars && (!requireFootnotes || hasFootnotes)) windows.push([...window]);
    }
  }
  return windows;
}

export function loadSample({ maxSections = 8, maxParagraphs = 6, minChars = 2000, random = false, requireFootnotes = true } = {}) {
  const data = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const docs = Object.entries(data.collections?.Farbrengens?.documents || {});
  const matches = [];
  for (const [documentId, doc] of docs) {
    const fields = doc.fields || {};
    const candidates = meaningfulSections(fields.parsedMainText || [], maxParagraphs);
    const windows = candidateWindows(candidates, maxSections, minChars, requireFootnotes);
    for (const selected of windows) {
      const sections = selected.map(section => ({ ...section, chars: charsOf(section.paragraphs) }));
      const all = sections.flatMap(section => section.paragraphs);
      matches.push({
        documentId,
        sourcePath: doc.path || '',
        title: cleanText(fields.title),
        sections,
        combinedChars: charsOf(all),
        footnoteCount: all.reduce((sum, item) => sum + item.footnotes.length, 0)
      });
    }
  }
  if (!matches.length) throw new Error('No larger footnote-bearing sample found');
  return random ? matches[Math.floor(Math.random() * matches.length)] : matches[0];
}
