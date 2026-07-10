// B"H
/** Strict parser: translation > v[index] > s[index] > en, with sup only. */
const HEBREW = /[\u0590-\u05FF]/;
const MARKER_ONLY = /^(?:[א-ת]{1,3}[.)]|(?:סעיף|אות)\s+[א-ת]{1,3})$/u;

function unescapeXml(text = '') {
  return String(text).replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function exactIndex(open, tag) {
  const match = open.match(new RegExp(`^<${tag}\\s+index="(\\d+)"\\s*>$`));
  if (!match) throw new Error(`Malformed XML: ${tag} must have exactly one numeric index attribute`);
  return Number(match[1]);
}

function assertOnlyWhitespace(value, context) {
  if (String(value).trim()) throw new Error(`Malformed XML: unexpected content in ${context}`);
}

function extractExactBlocks(content, regex, context) {
  const matches = [...content.matchAll(regex)];
  let cursor = 0;
  for (const match of matches) {
    assertOnlyWhitespace(content.slice(cursor, match.index), context);
    cursor = match.index + match[0].length;
  }
  assertOnlyWhitespace(content.slice(cursor), context);
  return matches;
}

function parseEn(sInner) {
  const match = sInner.match(/^\s*<en\s*>([\s\S]*?)<\/en>\s*$/);
  const self = sInner.match(/^\s*<en\s*\/>\s*$/);
  if (!match && !self) throw new Error('Malformed XML: each s must contain exactly one en');
  const raw = match ? match[1].trim() : '';
  const footnotes = [...raw.matchAll(/<sup\s*>(\d{1,3})<\/sup>/g)].map(item => item[1]);
  const residual = raw.replace(/<sup\s*>\d{1,3}<\/sup>/g, '');
  if (/<[^>]+>/.test(residual)) throw new Error('Malformed XML: only sup tags are allowed inside en');
  return { raw, value: unescapeXml(raw), footnotes };
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
  if (!root) throw new Error('Malformed XML: missing exact translation root');
  const vMatches = extractExactBlocks(root[1], /<v\b[^>]*>[\s\S]*?<\/v>/g, 'translation');
  const sections = vMatches.map(vMatch => {
    const block = vMatch[0];
    const open = block.match(/^<v\b[^>]*>/)?.[0] || '';
    const sectionIndex = exactIndex(open, 'v');
    const inner = block.slice(open.length, -4);
    const sMatches = extractExactBlocks(inner, /<s\b[^>]*>[\s\S]*?<\/s>/g, `v ${sectionIndex}`);
    const paragraphs = sMatches.map(sMatch => {
      const sBlock = sMatch[0];
      const sOpen = sBlock.match(/^<s\b[^>]*>/)?.[0] || '';
      const index = exactIndex(sOpen, 's');
      const en = parseEn(sBlock.slice(sOpen.length, -4));
      return { index, english: en.value, englishRaw: en.raw, footnotes: en.footnotes, enTagCount: 1 };
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
    if (actualV.paragraphs.length !== v.paragraphs.length) errors.push(`s count mismatch in v ${v.sectionIndex}`);
    v.paragraphs.forEach((s, sPos) => {
      const actualS = actualV.paragraphs[sPos];
      if (actualS && actualS.index !== s.paragraphIndex) errors.push(`s order mismatch ${v.sectionIndex}:${sPos}`);
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
  const expected = new Map(expectedVs(sample).flatMap(v => v.paragraphs.map(s => [key(v.sectionIndex, s.paragraphIndex), s])));
  parsed.sections.forEach(v => v.paragraphs.forEach(s => {
    const id = key(v.sectionIndex, s.index);
    if (!s.english) errors.push(`empty English at ${id}`);
    if (MARKER_ONLY.test(s.english.trim()) || (HEBREW.test(s.english) && s.english.trim().length <= 4)) errors.push(`structural Hebrew copied at ${id}`);
    const wanted = expected.get(id)?.footnotes || [];
    if (JSON.stringify(s.footnotes) !== JSON.stringify(wanted)) errors.push(`footnotes mismatch at ${id}: expected [${wanted}] got [${s.footnotes}]`);
    const withoutSup = s.englishRaw.replace(/<sup\s*>\d{1,3}<\/sup>/g, '');
    for (const number of wanted) if (new RegExp(`(?<!\\d)${number}(?!\\d)`).test(withoutSup)) errors.push(`bare footnote ${number} at ${id}`);
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
