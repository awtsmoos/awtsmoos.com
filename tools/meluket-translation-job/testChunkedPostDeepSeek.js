// B"H
/**
 * Chunked full-post DeepSeek XML alignment test.
 * Sends one Meluket post as several section-range requests, validates all
 * coordinates, merges fragments, and writes nothing to the database.
 */
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { buildWholePostPrompt } = require('./meluketWholePostPrompt.js');

const apiKey = process.env.DEEPSEEK_API_KEY;
const outDir = path.join(process.env.AWTSMOOS_JOB_ROOT || '/Users/awtsmoos/Documents/awtsmoos-jobs/meluket-translation-job', 'generated', 'chunked-post-test');
const postsDbFile = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/socialPacked/social.heichel.ikar.posts.fs.awtsdb';
const seriesId = process.argv.find(a => a.startsWith('--series='))?.split('=')[1] || 'כסלו_meluket';
const postIdArg = process.argv.find(a => a.startsWith('--post='))?.split('=')[1] || null;
const sectionsPerRequest = Number(process.argv.find(a => a.startsWith('--sectionsPerRequest='))?.split('=')[1] || 3);
const model = process.argv.find(a => a.startsWith('--model='))?.split('=')[1] || 'deepseek-chat';

function stripHtml(text) { return String(text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
function escapeXml(text = '') { return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
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
    return { baseBatchId: `chunked-post-${Date.now()}`, seriesId, postId, title: post.title, sections };
  } finally { closeDb(db); }
}
function chunkSections(base) {
  const chunks = [];
  for (let i = 0; i < base.sections.length; i += sectionsPerRequest) {
    chunks.push({ batchId: `${base.baseBatchId}-part-${String(chunks.length + 1).padStart(3, '0')}`, seriesId: base.seriesId, postId: base.postId, title: base.title, sections: base.sections.slice(i, i + sectionsPerRequest) });
  }
  return chunks;
}
function attr(text, name) { const m = text.match(new RegExp(`${name}="([^"]*)"`)); return m ? m[1] : ''; }
function unescapeXml(text) { return String(text).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
function textTag(xml, name) { return unescapeXml((xml.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`)) || [])[1] || '').trim(); }
function stripMarkdownFences(xml) { return xml.replace(/^\s*```(?:xml)?\s*/i, '').replace(/\s*```\s*$/i, '').trim(); }
function parseFragment(rawXml) {
  const hadFence = /^\s*```/i.test(rawXml);
  const xml = stripMarkdownFences(rawXml);
  const rootOpen = xml.match(/<awtsmoosMeluketTranslation\b[^>]*>/)?.[0] || '';
  const sections = [];
  for (const sectionBlock of [...xml.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)].map(m => m[0])) {
    const sectionOpen = sectionBlock.match(/<section\b[^>]*>/)?.[0] || '';
    const v = Number(attr(sectionOpen, 'v'));
    const sectionSummaryBrief = textTag(sectionBlock, 'sectionSummaryBrief');
    const translations = [...sectionBlock.matchAll(/<t\b[^>]*>[\s\S]*?<\/t>/g)].map(m => m[0]).map(tBlock => {
      const open = tBlock.match(/<t\b[^>]*>/)?.[0] || '';
      return { v, s: Number(attr(open, 's')), translation: unescapeXml((tBlock.match(/<t\b[^>]*>([\s\S]*?)<\/t>/) || [])[1] || '').trim() };
    });
    sections.push({ v, sectionSummaryBrief, translations });
  }
  return { hadFence, xml, root: { heichel: attr(rootOpen, 'heichel'), alias: attr(rootOpen, 'alias'), seriesId: attr(rootOpen, 'seriesId'), postId: attr(rootOpen, 'postId'), batchId: attr(rootOpen, 'batchId') }, sections };
}
function expectedKeys(batch) { const out = new Set(); for (const section of batch.sections) for (const item of section.items) out.add(`${section.v}:${item.s}`); return out; }
function validateFragment(batch, parsed) {
  const expected = expectedKeys(batch);
  const actual = new Set(parsed.sections.flatMap(sec => sec.translations.map(t => `${t.v}:${t.s}`)));
  const missing = [...expected].filter(k => !actual.has(k));
  const extra = [...actual].filter(k => !expected.has(k));
  const empty = parsed.sections.flatMap(sec => sec.translations).filter(t => !t.translation).map(t => `${t.v}:${t.s}`);
  const expectedSummaryVs = new Set(batch.sections.map(s => String(s.v)));
  const summaryVs = new Set(parsed.sections.filter(s => s.sectionSummaryBrief).map(s => String(s.v)));
  const missingSummaries = [...expectedSummaryVs].filter(v => !summaryVs.has(v));
  const rootOk = parsed.root.seriesId === batch.seriesId && parsed.root.postId === batch.postId && parsed.root.batchId === batch.batchId && parsed.root.alias === 'meluket_translation_en';
  return { ok: rootOk && !missing.length && !extra.length && !empty.length && !missingSummaries.length, rootOk, expected: expected.size, returned: actual.size, missing, extra, empty, missingSummaries, markdownFencePresent: parsed.hadFence };
}
function validateMerged(base, fragments) {
  const expected = expectedKeys(base);
  const translations = new Map();
  const summaries = new Map();
  const duplicates = [];
  for (const frag of fragments) {
    for (const sec of frag.parsed.sections) {
      if (summaries.has(sec.v)) duplicates.push(`summary:${sec.v}`);
      summaries.set(sec.v, sec.sectionSummaryBrief);
      for (const t of sec.translations) {
        const key = `${t.v}:${t.s}`;
        if (translations.has(key)) duplicates.push(key);
        translations.set(key, t.translation);
      }
    }
  }
  const actual = new Set(translations.keys());
  const missing = [...expected].filter(k => !actual.has(k));
  const extra = [...actual].filter(k => !expected.has(k));
  const missingSummaries = base.sections.map(s => String(s.v)).filter(v => !summaries.has(Number(v)) || !summaries.get(Number(v)));
  return { ok: !missing.length && !extra.length && !duplicates.length && !missingSummaries.length, expectedTranslations: expected.size, returnedTranslations: actual.size, missing, extra, duplicates, expectedSummaries: base.sections.length, returnedSummaries: summaries.size, missingSummaries };
}
function mergedXml(base, fragments) {
  const byV = new Map();
  for (const frag of fragments) for (const sec of frag.parsed.sections) byV.set(sec.v, sec);
  return `<awtsmoosMeluketTranslation heichel="ikar" alias="meluket_translation_en" seriesId="${escapeXml(base.seriesId)}" postId="${escapeXml(base.postId)}" batchId="${escapeXml(base.baseBatchId)}">\n${base.sections.map(section => {
    const sec = byV.get(section.v);
    return `  <section v="${section.v}">\n    <sectionSummaryBrief>${escapeXml(sec?.sectionSummaryBrief || '')}</sectionSummaryBrief>\n${section.items.map(item => `    <t s="${item.s}">${escapeXml((sec?.translations || []).find(t => t.s === item.s)?.translation || '')}</t>`).join('\n')}\n  </section>`;
  }).join('\n')}\n</awtsmoosMeluketTranslation>`;
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
  fs.rmSync(outDir, { recursive: true, force: true }); fs.mkdirSync(outDir, { recursive: true });
  const base = collectPostBatch();
  const chunks = chunkSections(base);
  fs.writeFileSync(path.join(outDir, 'source-post.json'), JSON.stringify(base, null, 2));
  const fragments = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const prompt = buildWholePostPrompt(chunk);
    fs.writeFileSync(path.join(outDir, `prompt-${String(i + 1).padStart(3, '0')}.xml.txt`), prompt);
    const response = await callDeepSeek(prompt);
    fs.writeFileSync(path.join(outDir, `response-${String(i + 1).padStart(3, '0')}.raw.json`), JSON.stringify(response.rawJson, null, 2));
    fs.writeFileSync(path.join(outDir, `response-${String(i + 1).padStart(3, '0')}.xml`), response.content.trim());
    const parsed = parseFragment(response.content);
    const validation = validateFragment(chunk, parsed);
    fragments.push({ chunkIndex: i + 1, chunk, status: response.status, parsed, validation });
    fs.writeFileSync(path.join(outDir, `validation-${String(i + 1).padStart(3, '0')}.json`), JSON.stringify({ validation, parsed }, null, 2));
    if (!validation.ok) break;
  }
  const merge = validateMerged(base, fragments);
  const xml = mergedXml(base, fragments);
  fs.writeFileSync(path.join(outDir, 'merged.xml'), xml);
  const report = { B_H: true, wroteNothingToDatabase: true, outDir, source: { seriesId: base.seriesId, postId: base.postId, title: base.title, sections: base.sections.length, sourceSubsections: [...expectedKeys(base)].length }, chunks: chunks.length, completedChunks: fragments.length, chunkResults: fragments.map(f => ({ chunkIndex: f.chunkIndex, sections: f.chunk.sections.map(s => s.v), expected: f.validation.expected, returned: f.validation.returned, ok: f.validation.ok, missing: f.validation.missing.slice(0, 20), missingSummaries: f.validation.missingSummaries, markdownFencePresent: f.validation.markdownFencePresent })), merge, sectionSummaries: fragments.flatMap(f => f.parsed.sections.map(s => ({ v: s.v, summary: s.sectionSummaryBrief }))), sampleTranslations: fragments.flatMap(f => f.parsed.sections.flatMap(s => s.translations.map(t => ({ v: t.v, s: t.s, translation: t.translation })))).slice(0, 30) };
  fs.writeFileSync(path.join(outDir, 'final-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (!merge.ok || fragments.length !== chunks.length) process.exitCode = 4;
}
main().catch(err => { console.error(err.stack || err.message); process.exit(1); });
