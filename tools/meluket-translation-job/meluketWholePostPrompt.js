// B"H
/**
 * Compact whole-post Meluket prompt builder.
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
You are translating one full maamar from Sefer Hamaamarim Meluket.

Return ONLY raw XML. Do NOT use markdown fences. Do NOT add commentary outside XML.

${glossary}

OUTPUT REQUIREMENTS:
- Root must be <awtsmoosMeluketTranslation>.
- Copy heichel, alias, seriesId, postId, and batchId exactly.
- Give <postIntroShort>: one sentence summary of the entire maamar.
- Give <postIntroLong>: a longer faithful "Eric novel style" atmospheric opening, but do not invent facts.
- For every input <section v="..."> return exactly one matching <section v="...">.
- For every input <src s="..."> return exactly one matching <t s="..."> translation.
- Preserve order. Do not skip, merge, split, or add subsections.
- Each section needs <sectionSummaryShort> and <sectionSummaryLong>.

EXPECTED XML SHAPE:
<awtsmoosMeluketTranslation heichel="ikar" alias="meluket_translation_en" seriesId="${escapeXml(postBatch.seriesId)}" postId="${escapeXml(postBatch.postId)}" batchId="${escapeXml(postBatch.batchId)}">
  <postIntroShort>...</postIntroShort>
  <postIntroLong>...</postIntroLong>
  <section v="0">
    <sectionSummaryShort>...</sectionSummaryShort>
    <sectionSummaryLong>...</sectionSummaryLong>
    <t s="0">...</t>
  </section>
</awtsmoosMeluketTranslation>

SOURCE_POST:
<awtsmoosMeluketSource heichel="ikar" seriesId="${escapeXml(postBatch.seriesId)}" postId="${escapeXml(postBatch.postId)}" title="${escapeXml(postBatch.title)}" batchId="${escapeXml(postBatch.batchId)}">
${sections}
</awtsmoosMeluketSource>`;
}

module.exports = { buildWholePostPrompt };
