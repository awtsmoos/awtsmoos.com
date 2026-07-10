// B"H
/** Footnote-free output policy. Canonical source and saved valid responses remain untouched. */
import { validateParsed } from './parse_xml.mjs';

export function sampleWithoutFootnotes(sample) {
  const sections = (sample.sections || []).map(section => ({
    ...section,
    paragraphs: (section.paragraphs || []).map(paragraph => ({ ...paragraph, footnotes: [] }))
  }));
  return { ...sample, sections, paragraphs: sections[0]?.paragraphs || sample.paragraphs || [] };
}

export function stripSupTags(xml = '') {
  return String(xml).replace(/<sup\s*>\d{1,3}<\/sup>/gi, '');
}

function parsedWithoutFootnotes(parsed) {
  const sections = (parsed.sections || []).map(section => ({
    ...section,
    paragraphs: (section.paragraphs || []).map(paragraph => ({
      ...paragraph,
      footnotes: [],
      englishRaw: stripSupTags(paragraph.englishRaw || ''),
      english: stripSupTags(paragraph.english || '')
    }))
  }));
  return { ...parsed, sections, sectionIndex: sections[0]?.sectionIndex,
    paragraphs: sections[0]?.paragraphs || [] };
}

export function validateForJob(sample, parsed, options = {}) {
  return validateParsed(sampleWithoutFootnotes(sample), parsedWithoutFootnotes(parsed), options);
}
