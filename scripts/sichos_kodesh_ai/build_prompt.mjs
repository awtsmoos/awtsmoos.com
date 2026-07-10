// B"H
/**
 * Sichos Kodesh XML prompt builder.
 *
 * The Awtsmoos gives each source subsection one narrow vessel. Footnote
 * sparks enter as fn and must emerge as sup, unchanged and in their place.
 */
export function escapeXml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function annotateFootnotes(text, footnotes = []) {
  let output = escapeXml(text);
  for (const number of footnotes) {
    const escaped = number.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    output = output.replace(new RegExp(`(?<!\\d)${escaped}(?!\\d)`), `<fn>${number}</fn>`);
  }
  return output;
}

const GLOSSARY = [
  'Preserve Torah and Chassidus terminology where appropriate.',
  'Translate ה׳ as Hashem.',
  'Translate הקב״ה as the Holy One, blessed be He.',
  'Use consistent Rebbe terminology: the Rebbe, the Alter Rebbe, the Baal Shem Tov.',
  'Do not modernize, simplify, flatten, or over-explain concepts.'
].join('\n');

export function sectionsOf(sample) {
  if (Array.isArray(sample.sections) && sample.sections.length) return sample.sections;
  return [{ sectionIndex: sample.sectionIndex, paragraphs: sample.paragraphs || [] }];
}

function sourceVs(sample) {
  return sectionsOf(sample).map(section => {
    const subsections = section.paragraphs.map(item => {
      return `<s index="${item.paragraphIndex}">${annotateFootnotes(item.text, item.footnotes)}</s>`;
    }).join('\n');
    return `<v index="${section.sectionIndex}">\n${subsections}\n</v>`;
  }).join('\n');
}

export function buildPrompt(sample) {
  const indices = sectionsOf(sample).map(section => section.sectionIndex).join(', ');
  return `B"H
Translate the following Sichos Kodesh Hebrew/Yiddish source to English.

Return XML only.
No Markdown.
No explanations.
No chain of thought.
No notes.
No commentary.

These source units are subsections, not ordinary paragraphs.
Preserve v order exactly.
Preserve s order exactly.
Never merge, split, omit, or reorder subsections.
Return one <v> for each source <v>, in this exact order: ${indices}.
Return one <s> for each source <s>, with the exact same index.

Required deterministic XML shape:
<translation>
<v index="SOURCE_V_INDEX">
<s index="SOURCE_S_INDEX"><en>English translation with <sup>23</sup> where required</en></s>
</v>
</translation>

Every <s> must contain exactly one <en> tag.
The only tag permitted inside <en> is <sup>.
No sum, topics, people, notes, or extra tags.
No attributes except index on v and s.

Footnote law:
Every source <fn>NUMBER</fn> is a footnote reference.
Preserve every footnote number exactly and in order.
Convert each <fn>NUMBER</fn> to <sup>NUMBER</sup> inside the corresponding <en>.
Never omit, renumber, reorder, duplicate, or invent a footnote.
Do not leave footnote numbers as bare text; they must be inside <sup> tags.

Hebrew structural markers are not prose.
Do not translate structural labels such as א., ב., ג., ד., א), ב), סעיף א, אות א.
Do not echo such markers inside <en>.

${GLOSSARY}

Source:
<source title="${escapeXml(sample.title)}" documentId="${escapeXml(sample.documentId)}">
${sourceVs(sample)}
</source>`;
}
