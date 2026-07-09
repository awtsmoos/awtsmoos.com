// B"H
/**
 * Prompt builder for reviewed Meluket XML translation batches.
 */
function escapeXml(text = '') {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildPrompt(batch) {
  return `B"H
You are translating Sefer Hamaamarim Meluket from Hebrew/Yiddish/Aramaic-inflected Chassidic Hebrew into clear, faithful English.

Return ONLY valid XML. No markdown. No commentary outside XML.
Preserve all IDs exactly. For every <source> entry, emit exactly one matching <subSection> translation.
Do not merge, skip, reorder, or invent entries.
Keep Rebbe/chassidus terms faithful; do not flatten technical concepts.

Required XML schema:
<awtsmoosTranslationBatch heichel="ikar" alias="meluket_translation_en" batchId="${escapeXml(batch.batchId)}">
  <post seriesId="..." postId="...">
    <section verseSection="0">
      <subSection index="0" sourceHash="sha256..."><translation>English...</translation></subSection>
    </section>
  </post>
</awtsmoosTranslationBatch>

SOURCE_BATCH:
<awtsmoosSourceBatch heichel="ikar" batchId="${escapeXml(batch.batchId)}">
${batch.items.map(item => `  <source seriesId="${escapeXml(item.seriesId)}" postId="${escapeXml(item.postId)}" verseSection="${item.verseSection}" subSection="${item.subSection}" sourceHash="${item.sourceHash}">${escapeXml(item.text)}</source>`).join('\n')}
</awtsmoosSourceBatch>`;
}

module.exports = { buildPrompt };
