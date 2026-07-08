#!/usr/bin/env node
// B"H
/**
 * Import real Sefer HaSichos 5748 English translations from verified swarm JSONL
 * into the official live packed comments DB.
 *
 * No English is invented. Rows are taken only from translations_5748*.jsonl.
 * The script backs up the packed comments DB before --apply and verifies that
 * written comments have English content and Hebrew source aligned to live posts.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const legacy = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

const DB_ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(DB_ROOT, 'ai/comment-rag');
const COMMENTS_DB = path.join(DB_ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const WORK = '/Users/awtsmoos/Documents/awtsmoos/sefer hasichos/sefer_hasichos_translation_swarm_20260702_1745/work';
const SOURCES = [
  path.join(WORK, 'translations_5748.jsonl'),
  path.join(WORK, 'translations_5748_remaining.jsonl')
];
const SERIES_ID = 'seferHaSichos5748';
const ALIAS = 'sefer_hasichos_translation_en';
const APPLY = process.argv.includes('--apply');
const RUN = path.join(RAG, `import_sefer_hasichos_5748_translations_${new Date().toISOString().replace(/[:.]/g, '-')}`);

function normalize(x) { return String(x || '').replace(/<[^>]+>/g, '').replace(/&lt;[^&]*?&gt;/g, '').replace(/\s+/g, ' ').trim(); }
function readJsonl(file) {
  const out = [];
  const lines = fs.readFileSync(file, 'utf8').split(/\n/).filter(Boolean);
  for (let i = 0; i < lines.length; i += 1) {
    try { out.push({ ...JSON.parse(lines[i]), __sourceFile: file, __line: i + 1 }); }
    catch (error) { out.push({ __parseError: String(error.message || error), __sourceFile: file, __line: i + 1, raw: lines[i].slice(0, 200) }); }
  }
  return out;
}
function openCommentsDb(readOnly = false) {
  const options = readOnly ? { debug: false, readOnly: true, processLockMode: 'shared', lockMode: 'shared' } : { debug: false };
  const db = new AwtsmoosDB(COMMENTS_DB, options);
  db.open();
  return db;
}
function closeDb(db) {
  try { db.fs?.flush?.(); db.waitForIdle?.(); } catch {}
  try { db.pager?.close?.(); db.processLock?.release?.(); } catch {}
}
function backupFile(file) {
  if (!fs.existsSync(file)) return null;
  const target = path.join(RUN, 'backup', file.replace(DB_ROOT, '').replace(/^\//, ''));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(file, target);
  return { from: file, to: target, bytes: fs.statSync(target).size };
}
function rowObject(item) {
  const verseSection = String(item.verseSection);
  const subSection = Number(item.subSection);
  const postId = item.postId;
  return {
    id: item.id,
    author: 'BH_shs_translation_en_import_5748',
    parentType: 'post',
    parentId: postId,
    seriesId: SERIES_ID,
    verseSection,
    subSection,
    content: String(item.content || ''),
    dayuh: {
      sourceHebrew: String(item.sourceHebrew || ''),
      verseSection,
      subSection,
      phrase: Number(item.phrase || subSection),
      model: item.model || '',
      translatedAt: item.translatedAt || '',
      sourceFile: path.basename(item.__sourceFile || ''),
      sourceLine: item.__line || null
    }
  };
}
function groupRows(items, posts) {
  const byId = new Map();
  const parseErrors = [];
  for (const item of items) {
    if (item.__parseError) { parseErrors.push(item); continue; }
    if (item.seriesId !== SERIES_ID) continue;
    if (!item.postId || !posts[item.postId]) continue;
    if (!item.id || !normalize(item.content) || !normalize(item.sourceHebrew)) continue;
    byId.set(item.id, item);
  }
  const byPost = new Map();
  for (const item of byId.values()) {
    if (!byPost.has(item.postId)) byPost.set(item.postId, []);
    byPost.get(item.postId).push(rowObject(item));
  }
  for (const rows of byPost.values()) {
    rows.sort((a, b) => Number(a.verseSection) - Number(b.verseSection) || Number(a.subSection) - Number(b.subSection) || a.id.localeCompare(b.id));
  }
  return { byPost, parseErrors, uniqueRows: byId.size };
}
function branchFromRows(rows) {
  const branch = {};
  for (const row of rows) {
    const key = String(row.verseSection);
    if (!branch[key]) branch[key] = [];
    branch[key].push(row);
  }
  return branch;
}
function rowsOf(branch) {
  return Object.keys(branch || {}).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b)).flatMap(k => Array.isArray(branch[k]) ? branch[k] : []);
}
function postHebrewAt(post, sec, sub) {
  const section = post?.dayuh?.sections?.[sec];
  if (!Array.isArray(section)) return '';
  for (const idx of [sub - 1, sub]) {
    if (idx >= 0 && idx < section.length) {
      const text = normalize(section[idx]);
      if (text) return text;
    }
  }
  return '';
}
function auditBranch(branch, post) {
  const rows = rowsOf(branch);
  let withEnglish = 0;
  let withHebrew = 0;
  let slotMatch = 0;
  for (const row of rows) {
    const en = normalize(row.content);
    const he = normalize(row.dayuh?.sourceHebrew || row.sourceHebrew);
    if (en) withEnglish += 1;
    if (he) withHebrew += 1;
    const postHe = postHebrewAt(post, Number(row.verseSection), Number(row.subSection));
    if (he && postHe && he === postHe) slotMatch += 1;
  }
  return { rows: rows.length, withEnglish, withHebrew, slotMatch };
}
async function main() {
  fs.mkdirSync(path.join(RUN, 'backup'), { recursive: true });
  const dos = new DosDB(DB_ROOT);
  await dos.init?.();
  const posts = await dos.get(`/social/heichelos/ikar/series/${SERIES_ID}/posts`);
  const postIds = posts && typeof posts === 'object' && !Array.isArray(posts) ? Object.keys(posts).filter(k => posts[k] && typeof posts[k] === 'object').sort() : [];
  const allItems = SOURCES.flatMap(readJsonl);
  const { byPost, parseErrors, uniqueRows } = groupRows(allItems, posts || {});
  const report = {
    BH: 'B"H',
    apply: APPLY,
    run: RUN,
    sources: SOURCES.map(file => ({ file, exists: fs.existsSync(file), lines: fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\n/).filter(Boolean).length : 0 })),
    postIds: postIds.length,
    inputRows: allItems.length,
    parseErrors: parseErrors.length,
    uniqueUsableRows: uniqueRows,
    groupedPosts: byPost.size,
    missingPostGroups: postIds.filter(id => !byPost.has(id)),
    backups: [],
    writtenPosts: 0,
    verifiedPosts: 0,
    totals: { rows: 0, withEnglish: 0, withHebrew: 0, slotMatch: 0 },
    samples: [],
    failures: []
  };
  if (APPLY) for (const backup of [backupFile(COMMENTS_DB), backupFile(`${COMMENTS_DB}.wal`)]) if (backup) report.backups.push(backup);

  const db = openCommentsDb(false);
  try {
    for (const postId of postIds) {
      const rows = byPost.get(postId) || [];
      if (!rows.length) {
        report.failures.push({ postId, reason: 'no_translation_rows' });
        continue;
      }
      const branch = branchFromRows(rows);
      const audit = auditBranch(branch, posts[postId]);
      report.totals.rows += audit.rows;
      report.totals.withEnglish += audit.withEnglish;
      report.totals.withHebrew += audit.withHebrew;
      report.totals.slotMatch += audit.slotMatch;
      if (audit.rows !== audit.withEnglish || audit.rows !== audit.withHebrew || audit.rows !== audit.slotMatch) {
        report.failures.push({ postId, reason: 'prewrite_alignment_failed', audit });
        continue;
      }
      const commentPath = `/social/heichelos/ikar/comments/atSeries/${SERIES_ID}/atPost/${postId}/${ALIAS}`;
      if (APPLY) {
        if (db.fs.stat(commentPath)?.exists) db.fs.rm(commentPath);
        db.fs.write(commentPath, legacy.serializeJSON(branch));
        report.writtenPosts += 1;
        const decoded = legacy.deserializeBinary(db.fs.cat(commentPath));
        const verify = auditBranch(decoded, posts[postId]);
        if (verify.rows === audit.rows && verify.withEnglish === audit.rows && verify.withHebrew === audit.rows && verify.slotMatch === audit.rows) report.verifiedPosts += 1;
        else report.failures.push({ postId, reason: 'postwrite_verify_failed', verify, expected: audit });
      }
      if (report.samples.length < 8) report.samples.push({ postId, commentPath, audit, first: rows[0] });
    }
    if (APPLY) db.fs.flush?.();
  } finally { closeDb(db); }
  fs.writeFileSync(path.join(RUN, 'summary.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
