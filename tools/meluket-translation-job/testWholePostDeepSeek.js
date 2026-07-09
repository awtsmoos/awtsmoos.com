// B"H
/**
 * Full-post DeepSeek XML alignment test.
 * One whole Meluket maamar, one network request, zero database writes.
 */
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { buildWholePostPrompt } = require('./meluketWholePostPrompt.js');

const apiKey = process.env.DEEPSEEK_API_KEY;
const outDir = path.join(__dirname, 'generated', 'whole-post-test');
const postsDbFile = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/socialPacked/social.heichel.ikar.posts.fs.awtsdb';
const seriesId = process.argv.find(a => a.startsWith('--series='))?.split('=')[1] || 'כסלו_meluket';
const postIdArg = process.argv.find(a => a.startsWith('--post='))?.split('=')[1] || null;
const model = process.argv.find(a => a.startsWith('--model='))?.split('=')[1] || 'deepseek-chat';

function stripHtml(text) { return String(text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
function escapeRegExp(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function openDb() { const db = new AwtsmoosDB(postsDbFile, { compression: false, reuseFreedSpace: 'verified', readOnly: true, processLockMode: 'shared', lockMode: 'shared' }); db.open(); return db; }
function closeDb(db) { try { db.pager?.close?.(); db.processLock?.release?.(); } catch {} }
function readPosts(db, id) { const p = `/social/heichelos/ikar/series/${id}/posts.awtsmoosJSON`; const st = db.fs.stat(p); return awts.deserializeBinary(db.fs.readRange(p, 0, st.size)); }
function keys(o) { return o && typeof o === 'object' && !Array.isArray(o) ? Object.keys(o).filter(k => !k.startsWith('__')) : []; }
function sectionParts(section) { if (Array.isArray(section)) return section.map(stripHtml).filter(Boolean); const single = stripHtml(section); return single ? [single] : []; }
function pickPost(posts) { if (postIdArg) return postIdArg; return keys(posts).find(id => (posts[id]?.dayuh?.sections || []).reduce((n, sec) => n + sectionParts(sec).length, 0) > 30) || keys(posts)[0]; }
function collectPostBatch() {
  const db = openDb();
  try {
    const posts = readPosts(db, seriesId);
    const postId = pickPost(posts);
    const post = posts[postId];
    const sections = [];
    for (let v = 0; v < (post.dayuh?.sections || []).length; v++) {
      const items = sectionParts(post.dayuh.sections[v]).map((text, s) => ({ s, text }));
      if (items.length) sections.push({ v, items });
    }
    return { batchId: `whole-post-${Date.now()}`, seriesId, postId, title: post.title, sections };
  } finally { closeDb(db); }
}
function attr(text, name) { const m = text.match(new RegExp(`${name}="([^"]*)"`)); return m ? m[1] : ''; }
function unescapeXml(text) { return String(text).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
function textTag(xml, name) { return unescapeXml((xml.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`)) || [])[1] || '').trim(); }
function stripMarkdownFences(xml) { return xml.replace(/^\s*```(?:xml)?\s*/i, '').replace(/\s*```\s*$/i, '').trim(); }
function parseReturned(rawXml) {
  const xml = stripMarkdownFences(rawXml);
  const rootOpen = xml.match(/<awtsmoosMeluketTranslation\b[^>]*>/)?.[0] || '';
  const returned = [];
  for (const sectionBlock of [...xml.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)].map(m => m[0])) {
    const sectionOpen = sectionBlock.match(/<section\b[^>]*>/)?.[0] || '';
    const v = Number(attr(sectionOpen, 'v'));
    const summaryShort = textTag(sectionBlock, 'sectionSummaryShort');
    const summaryLong = textTag(sectionBlock, 'sectionSummaryLong');
    for (const tBlock of [...sectionBlock.matchAll(/<t\b[^>]*>[\s\S]*?<\/t>/g)].map(m => m[0])) {
      const tOpen = tBlock.match(/<t\b[^>]*>/)?.[0] || '';
      const s = Number(attr(tOpen, 's'));
      const translation = unescapeXml((tBlock.match(/<t\b[^>]*>([\s\S]*?)<\/t>/) || [])[1] || '').trim();
      returned.push({ v, s, translation });
    }
    returned.push({ v, __summary: true, summaryShort, summaryLong });
  }
  return { xml, root: { heichel: attr(rootOpen, 'heichel'), alias: attr(rootOpen, 'alias'), seriesId: attr(rootOpen, 'seriesId'), postId: attr(rootOpen, 'postId'), batchId: attr(rootOpen, 'batchId') }, postSummaryShort: textTag(xml, 'postSummaryShort'), postSummaryEpic: textTag(xml, 'postSummaryEpic'), returned };
}
function validate(batch, parsed) {
  const expected = new Set();
  for (const section of batch.sections) for (const item of section.items) expected.add(`${section.v}:${item.s}`);
  const actual = new Set(parsed.returned.filter(x => !x.__summary).map(x => `${x.v}:${x.s}`));
  const missing = [...expected].filter(x => !actual.has(x));
  const extra = [...actual].filter(x => !expected.has(x));
  const emptyTranslations = parsed.returned.filter(x => !x.__summary && !x.translation).map(x => `${x.v}:${x.s}`);
  const expectedSections = new Set(batch.sections.map(x => String(x.v)));
  const summarySections = new Set(parsed.returned.filter(x => x.__summary && x.summaryShort && x.summaryLong).map(x => String(x.v)));
  const missingSummaries = [...expectedSections].filter(x => !summarySections.has(x));
  const rootOk = parsed.root.seriesId === batch.seriesId && parsed.root.postId === batch.postId && parsed.root.batchId === batch.batchId && parsed.root.alias === 'meluket_translation_en';
  const hasPostSummaries = !!parsed.postSummaryShort && !!parsed.postSummaryEpic;
  return { ok: rootOk && hasPostSummaries && !missing.length && !extra.length && !emptyTranslations.length && !missingSummaries.length, rootOk, hasPostSummaries, expectedTranslations: expected.size, returnedTranslations: actual.size, missing, extra, emptyTranslations, expectedSectionSummaries: expectedSections.size, missingSummaries, markdownFencePresent: /^\s*```/i.test(parsed.xml) };
}
async function callDeepSeek(prompt) {
  const res = await fetch('https://api.deepseek.com/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model, temperature: 0.1, messages: [{ role: 'user', content: prompt }] }) });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch {}
  if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}: ${text.slice(0, 1000)}`);
  return { status: res.status, rawJson: json, content: json?.choices?.[0]?.message?.content || '' };
}
async function main() {
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not set');
  fs.mkdirSync(outDir, { recursive: true });
  const batch = collectPostBatch();
  const prompt = buildWholePostPrompt(batch);
  fs.writeFileSync(path.join(outDir, 'prompt.xml.txt'), prompt);
  fs.writeFileSync(path.join(outDir, 'source-batch.json'), JSON.stringify(batch, null, 2));
  const sourceSubsections = batch.sections.reduce((n, sec) => n + sec.items.length, 0);
  const response = await callDeepSeek(prompt);
  fs.writeFileSync(path.join(outDir, 'response.raw.json'), JSON.stringify(response.rawJson, null, 2));
  fs.writeFileSync(path.join(outDir, 'response.xml'), response.content.trim());
  const parsed = parseReturned(response.content);
  const validation = validate(batch, parsed);
  const report = { B_H: true, wroteNothingToDatabase: true, outDir, source: { seriesId: batch.seriesId, postId: batch.postId, title: batch.title, sections: batch.sections.length, sourceSubsections }, deepseekStatus: response.status, validation, postSummaryShort: parsed.postSummaryShort, postSummaryEpicPreview: parsed.postSummaryEpic.slice(0, 1200), sampleTranslations: parsed.returned.filter(x => !x.__summary).slice(0, 12) };
  fs.writeFileSync(path.join(outDir, 'validation-report.json'), JSON.stringify({ ...report, parsed }, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (!validation.ok) process.exitCode = 4;
}
main().catch(err => { console.error(err.stack || err.message); process.exit(1); });
