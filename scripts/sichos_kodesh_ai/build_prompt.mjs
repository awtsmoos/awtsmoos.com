// B"H
/** Minimal translation prompt using prompt-only text proven by raw sup tags. */
export function escapeXml(text = '') {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function sectionsOf(sample) {
  if (Array.isArray(sample.sections) && sample.sections.length) return sample.sections;
  return [{ sectionIndex: sample.sectionIndex, paragraphs: sample.paragraphs || [] }];
}

function sourceXml(sample) {
  return sectionsOf(sample).map(section => {
    const body = section.paragraphs.map(item =>
      `<s index="${item.paragraphIndex}">${escapeXml(item.promptText ?? item.text)}</s>`
    ).join('\n');
    return `<v index="${section.sectionIndex}">\n${body}\n</v>`;
  }).join('\n');
}

function manifest(sample) {
  return sectionsOf(sample).map(section =>
    section.paragraphs.map(item => `${section.sectionIndex}:${item.paragraphIndex}`).join(' ')
  ).join('\n');
}

export function buildPrompt(sample, { retryFeedback = '' } = {}) {
  const retry = retryFeedback ? `\nPrevious output failed:\n${retryFeedback}\nFix only these structural errors.\n` : '';
  return `Translate the source to English.
Return XML only.
Return exactly these v:s units in this order:
${manifest(sample)}

Use only this shape:
<translation><v index="1"><s index="0"><en>English</en></s></v></translation>

Rules:
- Exactly one v for each listed v index.
- Exactly one s for each listed s index.
- Exactly one en inside every s.
- No tags inside en.
- Do not use English contractions. Write full forms such as "do not," "cannot," and "it is."
- No extra sections, notes, Markdown, summaries, or commentary.
- Preserve Torah and Chassidus terminology.
- Do not simplify or paraphrase.
${retry}
<source>
${sourceXml(sample)}
</source>`;
}
