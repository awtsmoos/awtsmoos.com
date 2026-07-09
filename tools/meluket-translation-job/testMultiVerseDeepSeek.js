// B"H
/**
 * Multi-verse, multi-subsection DeepSeek XML alignment test.
 * One network request, zero database writes. Output goes outside git.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { buildPrompt } = require('./meluketPrompt.js');
const { generatedDir } = require('./jobPaths.js');

const apiKey = process.env.DEEPSEEK_API_KEY;
const outDir = generatedDir('multi-test');
const postsDbFile = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/socialPacked/social.heichel.ikar.posts.fs.awtsdb';
const seriesId = process.argv.find(a => a.startsWith('--series='))?.split('=')[1] || 'כסלו_meluket';
const postIdArg = process.argv.find(a => a.startsWith('--post='))?.split('=')[1] || null;
const startSection = Number(process.argv.find(a => a.startsWith('--startSection='))?.split('=')[1] || 1);
const sectionCount = Number(process.argv.find(a => a.startsWith('--sectionCount='))?.split('=')[1] || 4);
const maxSubsectionsPerSection = Number(process.argv.find(a => a.startsWith('--maxSubsectionsPerSection='))?.split('=')[1] || 3);
const maxCharsPerSubsection = Number(process.argv.find(a => a.startsWith('--maxChars='))?.split('=')[1] || 360);

function sha(text) { return crypto.createHash('sha256').update(String(text)).digest('hex'); }
function stripHtml(text) { return String(text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
function openDb() { const db = new AwtsmoosDB(postsDbFile, { compression: false, reuseFreedSpace: 'verified', readOnly: true, processLockMode: 'shared', lockMode: 'shared' }); db.open(); return db; }
function closeDb(db) { try { db.pager?.close?.(); db.processLock?.release?.(); } catch {} }
function readPosts(db, id) { const p = `/social/heichelos/ikar/series/${id}/posts.awtsmoosJSON`; const st = db.fs.stat(p); return awts.deserializeBinary(db.fs.readRange(p, 0, st.size)); }
function keys(o) { return o && typeof o === 'object' && !Array.isArray(o) ? Object.keys(o).filter(k => !k.startsWith('__')) : []; }
function sectionParts(section) { if (Array.isArray(section)) return section.map(String); const raw = String(section || ''); const split = raw.split(/(?:\n{2,}|(?<=\.)\s+(?=[א-ת]))/).map(s => s.trim()).filter(Boolean); return split.length > 1 ? split : [raw]; }
function pickPost(posts) { if (postIdArg) return postIdArg; return keys(posts).find(id => (posts[id]?.dayuh?.sections || []).length >= startSection + sectionCount) || keys(posts)[0]; }

function collectBatch() {
  const db = openDb();
  try {
    const posts = readPosts(db, seriesId);
    const postId = pickPost(posts);
    const post = posts[postId];
    const items = [];
    for (let verseSection = startSection; verseSection < startSection + sectionCount; verseSection++) {
      const parts = sectionParts(post.dayuh?.sections?.[verseSection]).slice(0, maxSubsectionsPerSection);
      parts.forEach((part, subSection) => {
        const clean = stripHtml(part).slice(0, maxCharsPerSubsection).trim();
        if (clean.length < 12) return;
        items.push({ seriesId, postId, postTitle: post.title, verseSection, subSection, sourceHash: sha(clean), text: clean });
      });
    }
    return { post, items };
  } finally { closeDb(db); }
}

function attr(text, name) { const m = text.match(new RegExp(`${name}="([^"]*)"`)); return m ? m[1] : ''; }
function unescapeXml(text) { return String(text).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
function parseReturned(xml) {
  const out = [];
  for (const postBlock of [...xml.matchAll(/<post\b[^>]*>[\s\S]*?<\/post>/g)].map(m => m[0])) {
    const postOpen = postBlock.match(/<post\b[^>]*>/)?.[0] || '';
    const postId = attr(postOpen, 'postId');
    const seriesId = attr(postOpen, 'seriesId');
    for (const sectionBlock of [...postBlock.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)].map(m => m[0])) {
      const sectionOpen = sectionBlock.match(/<section\b[^>]*>/)?.[0] || '';
      const verseSection = Number(attr(sectionOpen, 'verseSection'));
      for (const subBlock of [...sectionBlock.matchAll(/<subSection\b[^>]*>[\s\S]*?<\/subSection>/g)].map(m => m[0])) {
        const subOpen = subBlock.match(/<subSection\b[^>]*>/)?.[0] || '';
        const subSection = Number(attr(subOpen, 'index'));
        const sourceHash = attr(subOpen, 'sourceHash');
        const translation = unescapeXml((subBlock.match(/<translation>([\s\S]*?)<\/translation>/) || [])[1] || '').trim();
        out.push({ seriesId, postId, verseSection, subSection, sourceHash, translation });
      }
    }
  }
  return out;
}
function validate(items, returned) {
  const wanted = new Map(items.map(x => [`${x.seriesId}|${x.postId}|${x.verseSection}|${x.subSection}|${x.sourceHash}`, x]));
  const got = new Map(returned.map(x => [`${x.seriesId}|${x.postId}|${x.verseSection}|${x.subSection}|${x.sourceHash}`, x]));
  const missing = [...wanted.keys()].filter(k => !got.has(k));
  const extra = [...got.keys()].filter(k => !wanted.has(k));
  const empty = returned.filter(x => !x.translation);
  return { ok: missing.length === 0 && extra.length === 0 && empty.length === 0, expected: wanted.size, returned: returned.length, missing, extra, emptyCount: empty.length };
}

async function callDeepSeek(prompt) {
  const res = await fetch('https://api.deepseek.com/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: 'deepseek-chat', temperature: 0.1, messages: [{ role: 'user', content: prompt }] }) });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch {}
  if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}: ${text.slice(0, 800)}`);
  return { status: res.status, rawJson: json, content: json?.choices?.[0]?.message?.content || '' };
}

async function main() {
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not set');
  fs.mkdirSync(outDir, { recursive: true });
  const { post, items } = collectBatch();
  const batch = { batchId: `multi-test-${Date.now()}`, items };
  const prompt = buildPrompt(batch);
  fs.writeFileSync(path.join(outDir, 'prompt.txt'), prompt);
  fs.writeFileSync(path.join(outDir, 'source-items.json'), JSON.stringify(items, null, 2));
  const response = await callDeepSeek(prompt);
  const xml = response.content.trim();
  fs.writeFileSync(path.join(outDir, 'response.xml'), xml);
  fs.writeFileSync(path.join(outDir, 'response.raw.json'), JSON.stringify(response.rawJson, null, 2));
  const returned = parseReturned(xml);
  const validation = validate(items, returned);
  const report = { B_H: true, wroteNothingToDatabase: true, outDir, sourcePost: { seriesId, postId: items[0]?.postId, title: post.title }, sourceItems: items, deepseekStatus: response.status, validation, returned };
  fs.writeFileSync(path.join(outDir, 'validation-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ...report, sourceItems: items.map(i => ({ verseSection: i.verseSection, subSection: i.subSection, sourceHash: i.sourceHash, sourcePreview: i.text.slice(0, 180) })), returned: returned.map(r => ({ verseSection: r.verseSection, subSection: r.subSection, sourceHash: r.sourceHash, translation: r.translation })) }, null, 2));
  if (!validation.ok) process.exitCode = 4;
}
main().catch(err => { console.error(err.stack || err.message); process.exit(1); });
