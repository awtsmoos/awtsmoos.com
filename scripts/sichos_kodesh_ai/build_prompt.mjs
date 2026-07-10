// B"H
/** Build a narrowly indexed XML translation prompt with retry diagnostics. */
export function escapeXml(text = '') {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function annotateFootnotes(text, footnotes = []) {
  let output = escapeXml(text);
  for (const number of footnotes) {
    const escaped = String(number).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    output = output.replace(new RegExp(`(?<!\\d)${escaped}(?!\\d)`), `<fn>${number}</fn>`);
  }
  return output;
}

export function sectionsOf(sample) {
  if (Array.isArray(sample.sections) && sample.sections.length) return sample.sections;
  return [{ sectionIndex: sample.sectionIndex, paragraphs: sample.paragraphs || [] }];
}

function sourceXml(sample) {
  return sectionsOf(sample).map(section => {
    const body = section.paragraphs.map(item =>
      `<s index="${item.paragraphIndex}">${annotateFootnotes(item.text, item.footnotes)}</s>`
    ).join('\n');
    return `<v index="${section.sectionIndex}">\n${body}\n</v>`;
  }).join('\n');
}

function exactManifest(sample) {
  return sectionsOf(sample).map(section => {
    const subsections = section.paragraphs.map(item => {
      const notes = (item.footnotes || []).join(',') || 'none';
      return `${section.sectionIndex}:${item.paragraphIndex}[${notes}]`;
    });
    return subsections.join(' ');
  }).join('\n');
}

export function buildPrompt(sample, { retryFeedback = '' } = {}) {
  const feedback = retryFeedback ? `\nPREVIOUS RESPONSE FAILED VALIDATION:\n${retryFeedback}\nCorrect only these failures.\n` : '';
  return `B"H
Translate only the source units below into English and return XML only.
Do not translate any section not present in the source.
Do not continue beyond the final listed subsection.

Exact required manifest, written as v:s[footnotes]:
${exactManifest(sample)}

Output law:
- Exactly one <translation> root.
- Exactly the listed v elements, in listed order.
- Exactly the listed s elements, in listed order.
- Every s contains exactly one en.
- Only sup tags may appear inside en.
- Convert every fn to a matching sup in the same subsection.
- Preserve repeated footnote references; [104,104] requires two <sup>104</sup> tags.
- Never invent, omit, move, reorder, or renumber footnotes.
- No Markdown, prose outside XML, comments, summaries, topics, or people.
- Preserve Torah and Chassidus terminology; use Hashem for ה׳.
- Do not modernize, simplify, paraphrase, or echo structural Hebrew labels.
${feedback}
Required shape:
<translation><v index="1"><s index="0"><en>English</en></s></v></translation>

Source:
<source title="${escapeXml(sample.title)}" documentId="${escapeXml(sample.documentId)}">
${sourceXml(sample)}
</source>`;
}
