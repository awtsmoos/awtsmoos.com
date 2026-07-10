// B"H
/**
 * Strict XML parser for Sichos Kodesh translation tests.
 *
 * The Awtsmoos permits only translation, v, s, en, and the tiny sup crowns
 * that guard footnote sparks. Every expected crown must return unchanged.
 */
const HEBREW = /[\u0590-\u05FF]/;
const MARKER_ONLY = /^(?:[א-ת]{1,3}[.)]|(?:סעיף|אות)\s+[א-ת]{1,3})$/u;

function unescapeXml(text = '') {
  return String(text).replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function attr(open, name) {
  const found = open.match(new RegExp(`${name}="([^"]*)"`));
  return found ? found[1] : null;
}

function innerEn(block) {
  const paired = [...block.matchAll(/<en\s*>([\s\S]*?)<\/en>/g)];
  const self = [...block.matchAll(/<en\s*\/>/g)];
  const raw = paired.length ? paired[0][1].trim() : '';
  const footnotes = [...raw.matchAll(/<sup\s*>(\d{1,3})<\/sup>/g)].map(match => match[1]);
  return { count: paired.length + self.length, raw, value: unescapeXml(raw), footnotes };
}

function expectedVs(sample) {
  if (Array.isArray(sample.sections) && sample.sections.length) return sample.sections;
  return [{ sectionIndex: sample.sectionIndex, paragraphs: sample.paragraphs || [] }];
}

function key(vIndex, sIndex) {
  return `${vIndex}:${sIndex}`;
}

export function stripFences(text) {
  return String(text || '').replace(/^\s*```(?:xml)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
}

export function parseSichosXml(rawXml) {
  const xml = stripFences(rawXml);
  const root = xml.match(/^<translation>\s*([\s\S]*?)\s*<\/translation>$/);
  if (!root) throw new Error('Malformed XML: missing exact <translation> root');
  const sections = [...root[1].matchAll(/<v\b[^>]*>[\s\S]*?<\/v>/g)].map(vMatch => {
    const block = vMatch[0];
    const open = block.match(/<v\b[^>]*>/)?.[0] || '';
    const sectionIndex = Number(attr(open, 'index'));
    const paragraphs = [...block.matchAll(/<s\b[^>]*>[\s\S]*?<\/s>/g)].map(sMatch => {
      const sBlock = sMatch[0];
      const sOpen = sBlock.match(/<s\b[^>]*>/)?.[0] || '';
      const en = innerEn(sBlock);
      return { index: Number(attr(sOpen, 'index')), english: en.value, englishRaw: en.raw, footnotes: en.footnotes, enTagCount: en.count };
    });
    return { sectionIndex, paragraphs };
  });
  return { sectionIndex: sections[0]?.sectionIndex, paragraphs: sections[0]?.paragraphs || [], sections, xml };
}

function validateShape(sample, parsed, errors) {
  const expected = expectedVs(sample);
  const expectedKeys = expected.flatMap(v => v.paragraphs.map(s => key(v.sectionIndex, s.paragraphIndex)));
  const actualKeys = parsed.sections.flatMap(v => v.paragraphs.map(s => key(v.sectionIndex, s.index)));
  if (parsed.sections.length !== expected.length) errors.push(`v count mismatch expected ${expected.length} got ${parsed.sections.length}`);
  expected.forEach((v, vPos) => {
    const actualV = parsed.sections[vPos];
    if (!actualV) return;
    if (actualV.sectionIndex !== v.sectionIndex) errors.push(`v order mismatch at ${vPos}`);
    if (!Number.isFinite(actualV.sectionIndex)) errors.push(`missing v index at ${vPos}`);
    if (actualV.paragraphs.length !== v.paragraphs.length) errors.push(`s count mismatch in v ${v.sectionIndex}`);
    v.paragraphs.forEach((s, sPos) => {
      const actualS = actualV.paragraphs[sPos];
      if (!actualS) return;
      if (actualS.index !== s.paragraphIndex) errors.push(`s order mismatch ${v.sectionIndex}:${sPos}`);
      if (!Number.isFinite(actualS.index)) errors.push(`missing s index ${v.sectionIndex}:${sPos}`);
    });
  });
  const duplicates = actualKeys.filter((item, index) => actualKeys.indexOf(item) !== index);
  const missing = expectedKeys.filter(item => !actualKeys.includes(item));
  const extra = actualKeys.filter(item => !expectedKeys.includes(item));
  duplicates.forEach(item => errors.push(`duplicate s ${item}`));
  missing.forEach(item => errors.push(`missing s ${item}`));
  extra.forEach(item => errors.push(`unexpected s ${item}`));
  return { expectedKeys, actualKeys, missing, extra, duplicates };
}

function validateContent(sample, parsed, errors) {
  const expectedByKey = new Map(expectedVs(sample).flatMap(v => v.paragraphs.map(s => [key(v.sectionIndex, s.paragraphIndex), s])));
  parsed.sections.forEach(v => v.paragraphs.forEach(s => {
    const id = key(v.sectionIndex, s.index);
    const expected = expectedByKey.get(id);
    if (s.enTagCount !== 1) errors.push(`en tag count ${s.enTagCount} at ${id}`);
    if (!s.english) errors.push(`empty English at ${id}`);
    if (MARKER_ONLY.test(s.english.trim()) || (HEBREW.test(s.english) && s.english.trim().length <= 4)) errors.push(`structural Hebrew copied into English at ${id}`);
    const expectedFootnotes = expected?.footnotes || [];
    if (JSON.stringify(s.footnotes) !== JSON.stringify(expectedFootnotes)) {
      errors.push(`footnotes mismatch at ${id}: expected [${expectedFootnotes.join(',')}] got [${s.footnotes.join(',')}]`);
    }
    const withoutSup = s.englishRaw.replace(/<sup\s*>\d{1,3}<\/sup>/g, '');
    for (const number of expectedFootnotes) {
      if (new RegExp(`(?<!\\d)${number}(?!\\d)`).test(withoutSup)) errors.push(`bare footnote ${number} outside sup at ${id}`);
    }
    const forbidden = withoutSup.match(/<\/?(?!sup\b)[a-zA-Z][^>]*>/g) || [];
    forbidden.forEach(tag => errors.push(`unexpected tag ${tag} at ${id}`));
  }));
}

export function validateParsed(sample, parsed, { throwOnError = false } = {}) {
  const errors = [];
  const shape = validateShape(sample, parsed, errors);
  validateContent(sample, parsed, errors);
  const validation = { ok: errors.length === 0, errors, ...shape };
  if (!validation.ok && throwOnError) throw new Error(`Invalid translation XML:\n${errors.join('\n')}`);
  return validation;
}
