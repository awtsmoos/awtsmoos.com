// B"H
/**
 * One-subsection DeepSeek pipeline test for Meluket.
 * Network call: exactly one DeepSeek request.
 * Database writes: none.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { buildPrompt } = require('./meluketPrompt.js');

const apiKey = process.env.DEEPSEEK_API_KEY;
const outDir = path.join(__dirname, 'generated', 'one-test');
const postsDbFile = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/socialPacked/social.heichel.ikar.posts.fs.awtsdb';
const preferredSeries = process.argv.find(a => a.startsWith('--series='))?.split('=')[1] || 'כסלו_meluket';
const preferredPost = process.argv.find(a => a.startsWith('--post='))?.split('=')[1] || null;
const preferredSection = process.argv.find(a => a.startsWith('--section='))?.split('=')[1];
const maxChars = Number(process.argv.find(a => a.startsWith('--maxChars='))?.split('=')[1] || 1200);

function sha(text) { return crypto.createHash('sha256').update(String(text)).digest('hex'); }
function stripHtml(text) { return String(text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
function openDb() { const db = new AwtsmoosDB(postsDbFile, { compression: false, reuseFreedSpace: 'verified', readOnly: true, processLockMode: 'shared', lockMode: 'shared' }); db.open(); return db; }
function closeDb(db) { try { db.pager?.close?.(); db.processLock?.release?.(); } catch {} }
function readPosts(db, seriesId) { const p = `/social/heichelos/ikar/series/${seriesId}/posts.awtsmoosJSON`; const st = db.fs.stat(p); return awts.deserializeBinary(db.fs.readRange(p, 0, st.size)); }
function keys(o) { return o && typeof o === 'object' && !Array.isArray(o) ? Object.keys(o).filter(k => !k.startsWith('__')) : []; }
function sectionParts(section) { if (Array.isArray(section)) return section.map(String); if (section == null) return []; return [String(section)]; }
function selectItem() {
  const db = openDb();
  try {
    const posts = readPosts(db, preferredSeries);
    const postIds = preferredPost ? [preferredPost] : keys(posts);
    for (const postId of postIds) {
      const post = posts[postId];
      const sections = post?.dayuh?.sections || [];
      const sectionIndexes = preferredSection !== undefined ? [Number(preferredSection)] : sections.map((_, i) => i);
      for (const verseSection of sectionIndexes) {
        for (const [subSection, raw] of sectionParts(sections[verseSection]).entries()) {
          const clean = stripHtml(raw).slice(0, maxChars).trim();
          if (clean.length < 40) continue;
          return { seriesId: preferredSeries, postId, postTitle: post.title, verseSection, subSection, sourceHash: sha(clean), text: clean };
        }
      }
    }
  } finally { closeDb(db); }
  throw new Error('No suitable Meluket subsection found');
}
function validateXml(xml, item) {
  const required = [
    '<awtsmoosTranslationBatch',
    `seriesId="${item.seriesId}"`,
    `postId="${item.postId}"`,
    `verseSection="${item.verseSection}"`,
    `index="${item.subSection}"`,
    `sourceHash="${item.sourceHash}"`,
    '<translation>',
    '</awtsmoosTranslationBatch>'
  ];
  const missing = required.filter(x => !xml.includes(x));
  const translation = (xml.match(/<translation>([\s\S]*?)<\/translation>/) || [])[1]?.trim() || '';
  return { ok: missing.length === 0 && translation.length > 0, missing, translationPreview: translation.slice(0, 500), translationLength: translation.length };
}
async function callDeepSeek(prompt) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'deepseek-chat', temperature: 0.1, messages: [{ role: 'user', content: prompt }] })
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}: ${text.slice(0, 800)}`);
  const content = json?.choices?.[0]?.message?.content || '';
  return { status: res.status, rawJson: json, content };
}
async function main() {
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not set');
  fs.mkdirSync(outDir, { recursive: true });
  const item = selectItem();
  const batch = { batchId: `one-test-${Date.now()}`, items: [item] };
  const prompt = buildPrompt(batch);
  fs.writeFileSync(path.join(outDir, 'prompt.txt'), prompt);
  fs.writeFileSync(path.join(outDir, 'source-item.json'), JSON.stringify(item, null, 2));
  const response = await callDeepSeek(prompt);
  const xml = response.content.trim();
  fs.writeFileSync(path.join(outDir, 'response.xml'), xml);
  fs.writeFileSync(path.join(outDir, 'response.raw.json'), JSON.stringify(response.rawJson, null, 2));
  const validation = validateXml(xml, item);
  fs.writeFileSync(path.join(outDir, 'validation.json'), JSON.stringify(validation, null, 2));
  console.log(JSON.stringify({ B_H: true, wroteNothingToDatabase: true, outDir, source: { seriesId: item.seriesId, postId: item.postId, postTitle: item.postTitle, verseSection: item.verseSection, subSection: item.subSection, sourceHash: item.sourceHash, sourcePreview: item.text.slice(0, 500) }, deepseekStatus: response.status, validation }, null, 2));
  if (!validation.ok) process.exitCode = 4;
}
main().catch(err => { console.error(err.stack || err.message); process.exit(1); });
