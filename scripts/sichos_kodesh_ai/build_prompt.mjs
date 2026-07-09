// B"H
/**
 * Tiny Sichos Kodesh prompt builder.
 * The Awtsmoos breathes through narrow XML vessels: no markdown, no noise,
 * only ordered sparks lifted from subsection to subsection.
 *
 * Summaries are rare lamps, not candles on every stone: only the first
 * subsection of a very large verse may carry one, and even then only when
 * the idea truly asks to be announced before its translation walks in.
 */
export function escapeXml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const GLOSSARY = [
  'Keep Torah/Chassidus terms intact when appropriate.',
  'Translate ה׳ as Hashem.',
  'Translate הקב״ה as the Holy One, blessed be He.',
  'Use: The Rebbe, Alter Rebbe, Baal Shem Tov.',
  'Preserve footnote markers/numbers exactly.'
].join('\n');

function sectionsOf(sample) {
  if (Array.isArray(sample.sections) && sample.sections.length) return sample.sections;
  return [{ sectionIndex: sample.sectionIndex, paragraphs: sample.paragraphs || [] }];
}

function sectionChars(section) {
  return [...section.paragraphs.map(item => item.text).join(' ')].length;
}

function sourceSections(sample) {
  return sectionsOf(sample).map(section => {
    const paragraphs = section.paragraphs.map(item => {
      return `<p i="${item.paragraphIndex}">${escapeXml(item.text)}</p>`;
    }).join('\n');
    return `<s i="${section.sectionIndex}" chars="${sectionChars(section)}">\n${paragraphs}\n</s>`;
  }).join('\n');
}

export function buildPrompt(sample) {
  const indices = sectionsOf(sample).map(section => section.sectionIndex).join(',');
  return `B"H
Translate Sichos Kodesh Hebrew/Yiddish to English.
Return XML only. No markdown. No explanations. No chain of thought.
Preserve order. Never merge, split, reorder, omit, or paraphrase.
Translate each <p> individually inside each <s>.
Summary rule: summaries should be rare. Each source <s> has a chars attribute. If chars is 500 or less, every <sum> in that section must be empty. If chars is over 500, you may put one concise <sum> only on that section's p i="0", and only if the section begins a major meaningful idea. All other paragraphs must use <sum/>.
Only add <topics> or <people> when obvious; otherwise empty tags.
${GLOSSARY}
Output exactly:
<sk><s i="SECTION"><p i="N"><sum>...</sum><en>...</en><topics>...</topics><people>...</people></p></s></sk>
Return one <s> for each source section, in this order: ${indices}.
Source:
<skSource title="${escapeXml(sample.title)}" post="${escapeXml(sample.documentId)}">
${sourceSections(sample)}
</skSource>`;
}
