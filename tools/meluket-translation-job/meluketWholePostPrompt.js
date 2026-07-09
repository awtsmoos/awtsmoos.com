// B"H
/**
 * Compact Meluket section-range prompt builder.
 * Sends seriesId/postId once and subsection coordinates only.
 */
function escapeXml(text = '') {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const glossary = `TRANSLITERATION / GLOSSARY RULES:
- יעקב = Yaakov, never Jacob.
- יצחק = Yitzchak, never Isaac.
- אברהם = Avraham, never Abraham.
- משה = Moshe, never Moses.
- דוד = Dovid, never David.
- עצמות / Atzmus = Awtsmoos.
- Preserve: Ein Sof, Sefiros, Nefesh HaBahamis, Nefesh HaElokis, Chayah, Yechidah.
- Use: The Rebbe, the Alter Rebbe, the Mitteler Rebbe, the Tzemach Tzedek.
- Translate faithfully; do not flatten Chassidic technical terms.`;

function buildWholePostPrompt(postBatch) {
  const sections = postBatch.sections.map(section => `  <section v="${section.v}">
${section.items.map(item => `    <src s="${item.s}">${escapeXml(item.text)}</src>`).join('\n')}
  </section>`).join('\n');
  return `B"H
You are translating a section range from one maamar in Sefer Hamaamarim Meluket.

Return ONLY raw XML. Do NOT use markdown fences. Do NOT add commentary outside XML.

${glossary}

OUTPUT REQUIREMENTS:
- Root must be <awtsmoosMeluketTranslation>.
- Copy heichel, alias, seriesId, postId, and batchId exactly.
- Do NOT write a whole-post summary.
- For every input <section v="..."> return exactly one matching <section v="...">.
- Each section must have <sectionSummaryBrief>: one short, clear summary sentence for that verseSection only.
- For every input <src s="..."> return exactly one matching <t s="..."> translation.
- Preserve order. Do not skip, merge, split, or add subsections.

EXPECTED XML SHAPE:
<awtsmoosMeluketTranslation heichel="ikar" alias="meluket_translation_en" seriesId="${escapeXml(postBatch.seriesId)}" postId="${escapeXml(postBatch.postId)}" batchId="${escapeXml(postBatch.batchId)}">
  <section v="0">
    <sectionSummaryBrief>One sentence summary of this section.</sectionSummaryBrief>
    <t s="0">...</t>
  </section>
</awtsmoosMeluketTranslation>

SOURCE_RANGE:
<awtsmoosMeluketSource heichel="ikar" seriesId="${escapeXml(postBatch.seriesId)}" postId="${escapeXml(postBatch.postId)}" title="${escapeXml(postBatch.title)}" batchId="${escapeXml(postBatch.batchId)}">
${sections}
</awtsmoosMeluketSource>`;
}

module.exports = { buildWholePostPrompt };
