// B"H
/**
 * Validates saved XML responses and converts them to review JSON.
 * No database writes happen here.
 */
const fs = require('fs');
const path = require('path');
const input = process.argv.find(a => a.startsWith('--input='))?.split('=')[1];
const output = process.argv.find(a => a.startsWith('--output='))?.split('=')[1] || path.join(__dirname, 'generated', 'parsed-comments.review.json');
if (!input) { console.error('Provide --input=/path/to/response.xml'); process.exit(2); }
function attr(text, name) { const m = text.match(new RegExp(`${name}="([^"]*)"`)); return m ? m[1] : ''; }
function textOf(tag) { const m = tag.match(/<translation>([\s\S]*?)<\/translation>/); return m ? m[1].trim() : ''; }
function unescapeXml(text) { return String(text).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
const xml = fs.readFileSync(input, 'utf8');
if (!/^\s*<awtsmoosTranslationBatch[\s>]/.test(xml) || !/<\/awtsmoosTranslationBatch>\s*$/.test(xml)) { console.error('Invalid root XML element'); process.exit(3); }
const postBlocks = [...xml.matchAll(/<post\b[^>]*>[\s\S]*?<\/post>/g)].map(m => m[0]);
const comments = {};
for (const postBlock of postBlocks) {
  const seriesId = attr(postBlock.match(/<post\b[^>]*>/)[0], 'seriesId');
  const postId = attr(postBlock.match(/<post\b[^>]*>/)[0], 'postId');
  if (!seriesId || !postId) throw new Error('Missing seriesId or postId');
  const key = `${seriesId}/${postId}`; comments[key] ||= {};
  const sectionBlocks = [...postBlock.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)].map(m => m[0]);
  for (const sectionBlock of sectionBlocks) {
    const verseSection = Number(attr(sectionBlock.match(/<section\b[^>]*>/)[0], 'verseSection'));
    if (!Number.isInteger(verseSection)) throw new Error(`Bad verseSection in ${key}`);
    comments[key][verseSection] ||= [];
    for (const sub of [...sectionBlock.matchAll(/<subSection\b[^>]*>[\s\S]*?<\/subSection>/g)].map(m => m[0])) {
      const subSection = Number(attr(sub.match(/<subSection\b[^>]*>/)[0], 'index'));
      const sourceHash = attr(sub.match(/<subSection\b[^>]*>/)[0], 'sourceHash');
      const translated = unescapeXml(textOf(sub));
      if (!Number.isInteger(subSection) || !sourceHash || !translated) throw new Error(`Bad subSection in ${key}:${verseSection}`);
      comments[key][verseSection].push({ content: { title: 'English translation', text: translated }, dayuh: { verseSection, subSection, sourceHash }, author: 'meluket_translation_en', verseSection, subSection });
    }
  }
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({ B_H: true, input, parsedAt: new Date().toISOString(), comments }, null, 2));
console.log(JSON.stringify({ output, postKeys: Object.keys(comments).length }, null, 2));
