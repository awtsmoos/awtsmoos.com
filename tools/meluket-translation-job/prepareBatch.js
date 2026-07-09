// B"H
/**
 * Read-only Meluket translation batch preparer.
 *
 * This script never calls DeepSeek and never writes to the database. Generated
 * prompt/review files are written outside the git repository under
 * AWTSMOOS_JOB_ROOT, defaulting to /Users/awtsmoos/Documents/awtsmoos-jobs.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { buildPrompt } = require('./meluketPrompt.js');
const { generatedDir } = require('./jobPaths.js');

const root = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/socialPacked';
const postsDbFile = path.join(root, 'social.heichel.ikar.posts.fs.awtsdb');
const months = ['תשרי_meluket','חשון_meluket','כסלו_meluket','טבת_meluket','שבט_meluket','אדר_meluket','ניסן_meluket','אייר_meluket','סיון_meluket','תמוז_meluket','מנחם אב_meluket','אלול_meluket'];
const outDir = generatedDir('prepared-batches');
const maxItems = Number(process.argv.find(a => a.startsWith('--maxItems='))?.split('=')[1] || 80);
const writeFiles = process.argv.includes('--write-files');

function sha(text) { return crypto.createHash('sha256').update(String(text)).digest('hex'); }
function openDb() { const db = new AwtsmoosDB(postsDbFile, { compression: false, reuseFreedSpace: 'verified', readOnly: true, processLockMode: 'shared', lockMode: 'shared' }); db.open(); return db; }
function closeDb(db) { try { db.pager?.close?.(); db.processLock?.release?.(); } catch {} }
function readPosts(db, seriesId) { const p = `/social/heichelos/ikar/series/${seriesId}/posts.awtsmoosJSON`; const st = db.fs.stat(p); return awts.deserializeBinary(db.fs.readRange(p, 0, st.size)); }
function keys(o) { return o && typeof o === 'object' && !Array.isArray(o) ? Object.keys(o).filter(k => !k.startsWith('__')) : []; }
function sectionParts(section) { if (Array.isArray(section)) return section.map(String); if (section == null) return []; return [String(section)]; }
function cleanText(text) { return String(text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }

function collectItems() {
  const db = openDb();
  const items = [];
  try {
    for (const seriesId of months) {
      const posts = readPosts(db, seriesId);
      for (const postId of keys(posts)) {
        const post = posts[postId];
        const sections = post.dayuh?.sections || [];
        sections.forEach((section, verseSection) => {
          sectionParts(section).forEach((text, subSection) => {
            const clean = cleanText(text);
            if (!clean) return;
            items.push({ seriesId, postId, postTitle: post.title, verseSection, subSection, sourceHash: sha(clean), text: clean });
          });
        });
      }
    }
  } finally {
    closeDb(db);
  }
  return items;
}

function makeBatches(items) {
  const batches = [];
  for (let i = 0; i < items.length; i += maxItems) {
    batches.push({ batchId: `meluket-${String(batches.length + 1).padStart(5, '0')}`, items: items.slice(i, i + maxItems) });
  }
  return batches;
}

function main() {
  const items = collectItems();
  const batches = makeBatches(items);
  const summary = { B_H: true, safe: 'no network calls are made', postsDbFile, totalItems: items.length, batchCount: batches.length, maxItems, outputDir: outDir, writeFiles };
  if (writeFiles) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
    fs.writeFileSync(path.join(outDir, 'deepseek-prompts.jsonl'), batches.map(batch => JSON.stringify({ batchId: batch.batchId, model: 'deepseek-chat', messages: [{ role: 'user', content: buildPrompt(batch) }] })).join('\n') + '\n');
    fs.writeFileSync(path.join(outDir, 'items.jsonl'), items.map(item => JSON.stringify(item)).join('\n') + '\n');
  }
  console.log(JSON.stringify(summary, null, 2));
}

main();
