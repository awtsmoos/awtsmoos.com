// B"H
/**
 * XML parser for the tiny test format.
 * Here finite regex fingers touch the garment; validation keeps the order holy.
 */
function unescapeXml(text = '') {
  return String(text)
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function attr(open, name) {
  return (open.match(new RegExp(`${name}="([^"]*)"`)) || [])[1] || '';
}

function tag(block, name) {
  const self = block.match(new RegExp(`<${name}\\s*/>`));
  if (self) return '';
  const match = block.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`));
  return unescapeXml((match || [])[1] || '').trim();
}

function expectedSections(sample) {
  if (Array.isArray(sample.sections) && sample.sections.length) return sample.sections;
  return [{ sectionIndex: sample.sectionIndex, paragraphs: sample.paragraphs || [] }];
}

export function stripFences(text) {
  return String(text || '').replace(/^\s*```(?:xml)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
}

export function parseSichosXml(rawXml) {
  const xml = stripFences(rawXml);
  const sections = [...xml.matchAll(/<s\b[^>]*>[\s\S]*?<\/s>/g)].map(sectionMatch => {
    const block = sectionMatch[0];
    const open = block.match(/<s\b[^>]*>/)?.[0] || '';
    const sectionIndex = Number(attr(open, 'i'));
    const paragraphs = [...block.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/g)].map(match => {
      const pBlock = match[0];
      const pOpen = pBlock.match(/<p\b[^>]*>/)?.[0] || '';
      return {
        index: Number(attr(pOpen, 'i')),
        summary: tag(pBlock, 'sum'),
        english: tag(pBlock, 'en'),
        topics: tag(pBlock, 'topics').split(/[,;\n]/).map(s => s.trim()).filter(Boolean),
        people: tag(pBlock, 'people').split(/[,;\n]/).map(s => s.trim()).filter(Boolean)
      };
    });
    return { sectionIndex, paragraphs };
  });
  return { sectionIndex: sections[0]?.sectionIndex, paragraphs: sections[0]?.paragraphs || [], sections, xml };
}

export function validateParsed(sample, parsed) {
  const expected = expectedSections(sample).flatMap(section => {
    return section.paragraphs.map(p => `${section.sectionIndex}:${p.paragraphIndex}`);
  });
  const actual = parsed.sections.flatMap(section => {
    return section.paragraphs.map(p => `${section.sectionIndex}:${p.index}`);
  });
  const missing = expected.filter(i => !actual.includes(i));
  const extra = actual.filter(i => !expected.includes(i));
  const emptyEnglish = parsed.sections.flatMap(section => {
    return section.paragraphs.filter(p => !p.english).map(p => `${section.sectionIndex}:${p.index}`);
  });
  const summaryOutsideFirst = parsed.sections.flatMap(section => {
    return section.paragraphs.filter(p => p.index !== 0 && p.summary).map(p => `${section.sectionIndex}:${p.index}`);
  });
  return {
    ok: !missing.length && !extra.length && !emptyEnglish.length && !summaryOutsideFirst.length,
    expected,
    actual,
    missing,
    extra,
    emptyEnglish,
    summaryOutsideFirst
  };
}
