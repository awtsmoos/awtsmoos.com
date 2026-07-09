// B"H
/**
 * Imports validated Meluket DeepSeek XML output as Awtsmoos comments.
 *
 * Default mode is dry-run. Use --run to write.
 * Writes only alias `meluket_translation_en` under the authoritative comments
 * AwtsmoosDB VirtualFS. Existing alias files are backed up before replacement.
 */
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

const aliasId = 'meluket_translation_en';
const dryRun = !process.argv.includes('--run');
const commentsDbFile = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/socialPacked/social.heichel.ikar.comments.fs.awtsdb';
const swarmDir = path.join(__dirname, 'generated', 'meluket-swarm');
const chunksDir = path.join(swarmDir, 'chunks');
const importDir = path.join(__dirname, 'generated', 'meluket-comment-import');

function decodeXml(text) {
  return String(text || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
function encodeId(text) {
  return Buffer.from(String(text)).toString('base64url').slice(0, 48);
}
function attr(openTag, name) {
  const found = String(openTag || '').match(new RegExp(`${name}="([^"]*)"`));
  return found ? decodeXml(found[1]) : '';
}
function textTag(block, name) {
  const found = String(block || '').match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`));
  return found ? decodeXml(found[1]).trim() : '';
}
function parseTranslationXml(xmlText) {
  const xml = String(xmlText || '').replace(/^\s*```(?:xml)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const sections = [];
  for (const match of xml.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)) {
    const sectionBlock = match[0];
    const open = sectionBlock.match(/<section\b[^>]*>/)?.[0] || '';
    const v = Number(attr(open, 'v'));
    const summary = textTag(sectionBlock, 'sectionSummaryBrief');
    const translations = [];
    for (const tMatch of sectionBlock.matchAll(/<t\b[^>]*>[\s\S]*?<\/t>/g)) {
      const tBlock = tMatch[0];
      const tOpen = tBlock.match(/<t\b[^>]*>/)?.[0] || '';
      translations.push({ v, s: Number(attr(tOpen, 's')), text: decodeXml((tBlock.match(/<t\b[^>]*>([\s\S]*?)<\/t>/) || [])[1] || '').trim() });
    }
    sections.push({ v, summary, translations });
  }
  return sections;
}
function bestXmlFile(dir) {
  const repaired = path.join(dir, 'response-repaired.xml');
  if (fs.existsSync(repaired)) return repaired;
  const attempts = fs.readdirSync(dir).filter(name => /^response-attempt-\d+\.xml$/.test(name)).sort();
  if (attempts.length) return path.join(dir, attempts[attempts.length - 1]);
  const plain = path.join(dir, 'response.xml');
  return fs.existsSync(plain) ? plain : null;
}
function readChunk(dir) {
  const source = JSON.parse(fs.readFileSync(path.join(dir, 'source.json'), 'utf8'));
  const xmlFile = bestXmlFile(dir);
  if (!xmlFile) throw new Error(`No XML output in ${dir}`);
  return { source, xmlFile, sections: parseTranslationXml(fs.readFileSync(xmlFile, 'utf8')) };
}
function commentPath(seriesId, postId) {
  return `/social/heichelos/ikar/comments/atSeries/${seriesId}/atPost/${postId}/${aliasId}.awtsmoosJSON`;
}
function translationComment({ seriesId, postId, v, s, text }) {
  return {
    id: `BH_${aliasId}_${encodeId(seriesId)}_${encodeId(postId)}_${v}_${s}`,
    author: aliasId,
    parentType: 'post',
    parentId: postId,
    seriesId,
    verseSection: String(v),
    content: text,
    dayuh: { verseSection: v, subSection: s, translationLanguage: 'en', source: 'deepseek-chat', kind: 'translation' }
  };
}
function summaryComment({ seriesId, postId, v, text }) {
  return {
    id: `BH_${aliasId}_${encodeId(seriesId)}_${encodeId(postId)}_${v}_summary`,
    author: aliasId,
    parentType: 'post',
    parentId: postId,
    seriesId,
    verseSection: String(v),
    content: text,
    dayuh: { verseSection: v, subSection: 'summary', translationLanguage: 'en', source: 'deepseek-chat', kind: 'sectionSummaryBrief' }
  };
}
function collectPosts() {
  const byPost = new Map();
  for (const name of fs.readdirSync(chunksDir)) {
    const dir = path.join(chunksDir, name);
    if (!fs.existsSync(path.join(dir, 'DONE.json'))) continue;
    const chunk = readChunk(dir);
    const key = `${chunk.source.seriesId}\u0000${chunk.source.postId}`;
    if (!byPost.has(key)) byPost.set(key, { seriesId: chunk.source.seriesId, postId: chunk.source.postId, title: chunk.source.title, sections: new Map(), translationKeys: new Set() });
    const post = byPost.get(key);
    for (const sec of chunk.sections) {
      if (!post.sections.has(sec.v)) post.sections.set(sec.v, { summary: sec.summary, translations: new Map() });
      const target = post.sections.get(sec.v);
      if (!target.summary && sec.summary) target.summary = sec.summary;
      for (const t of sec.translations) {
        const tKey = `${sec.v}:${t.s}`;
        if (post.translationKeys.has(tKey)) throw new Error(`Duplicate translation ${key} ${tKey}`);
        post.translationKeys.add(tKey);
        target.translations.set(t.s, t.text);
      }
    }
  }
  return [...byPost.values()];
}
function buildAliasObject(post) {
  const out = {};
  let translationCount = 0;
  let summaryCount = 0;
  for (const [v, sec] of [...post.sections.entries()].sort((a, b) => a[0] - b[0])) {
    const rows = [];
    if (sec.summary) {
      rows.push(summaryComment({ seriesId: post.seriesId, postId: post.postId, v, text: sec.summary }));
      summaryCount++;
    }
    for (const [s, text] of [...sec.translations.entries()].sort((a, b) => a[0] - b[0])) {
      rows.push(translationComment({ seriesId: post.seriesId, postId: post.postId, v, s, text }));
      translationCount++;
    }
    out[String(v)] = rows;
  }
  return { object: out, translationCount, summaryCount, sectionCount: post.sections.size };
}
function readVirtualObject(db, virtualPath) {
  try {
    const stat = db.fs.stat(virtualPath);
    if (!stat?.exists || stat.type !== 'file' || !stat.size) return null;
    return awts.deserializeBinary(db.fs.readRange(virtualPath, 0, stat.size));
  } catch {
    return null;
  }
}
function writeVirtualObject(db, virtualPath, object) {
  db.fs.write(virtualPath, awts.serializeJSON(object));
}
function backupExisting(db, virtualPath, postKey) {
  const existing = readVirtualObject(db, virtualPath);
  if (!existing) return null;
  fs.mkdirSync(path.join(importDir, 'backups'), { recursive: true });
  const backupPath = path.join(importDir, 'backups', `${postKey}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2));
  return backupPath;
}
function verifyCounts(posts) {
  const report = { posts: posts.length, translations: 0, summaries: 0, sections: 0, files: [] };
  for (const post of posts) {
    const built = buildAliasObject(post);
    report.translations += built.translationCount;
    report.summaries += built.summaryCount;
    report.sections += built.sectionCount;
    report.files.push({ seriesId: post.seriesId, postId: post.postId, title: post.title, path: commentPath(post.seriesId, post.postId), translations: built.translationCount, summaries: built.summaryCount, sections: built.sectionCount });
  }
  return report;
}
function main() {
  fs.mkdirSync(importDir, { recursive: true });
  const posts = collectPosts();
  const report = verifyCounts(posts);
  fs.writeFileSync(path.join(importDir, 'dry-run-report.json'), JSON.stringify({ B_H: true, dryRun, aliasId, commentsDbFile, ...report }, null, 2));
  if (report.translations !== 88043) throw new Error(`Expected 88043 translations, got ${report.translations}`);
  if (dryRun) {
    console.log(JSON.stringify({ B_H: true, dryRun, aliasId, commentsDbFile, ...report, sample: report.files.slice(0, 5) }, null, 2));
    return;
  }
  const db = new AwtsmoosDB(commentsDbFile, { compression: false, reuseFreedSpace: 'verified', processLockMode: 'exclusive', lockMode: 'exclusive' });
  db.open();
  try {
    const writes = [];
    for (const post of posts) {
      const built = buildAliasObject(post);
      const virtualPath = commentPath(post.seriesId, post.postId);
      const postKey = `${encodeId(post.seriesId)}__${encodeId(post.postId)}`;
      const backupPath = backupExisting(db, virtualPath, postKey);
      writeVirtualObject(db, virtualPath, built.object);
      const verify = readVirtualObject(db, virtualPath);
      const verifyTranslations = Object.values(verify || {}).flat().filter(row => row?.dayuh?.kind === 'translation').length;
      const verifySummaries = Object.values(verify || {}).flat().filter(row => row?.dayuh?.kind === 'sectionSummaryBrief').length;
      if (verifyTranslations !== built.translationCount || verifySummaries !== built.summaryCount) throw new Error(`Verify failed for ${virtualPath}`);
      writes.push({ virtualPath, backupPath, translations: built.translationCount, summaries: built.summaryCount });
    }
    try { db.fs.flush?.(); } catch (e) { throw new Error(`VirtualFS flush failed: ${e.message}`); }
    try { db.fs.patchClose?.(); } catch (e) { throw new Error(`VirtualFS patchClose failed: ${e.message}`); }
    fs.writeFileSync(path.join(importDir, 'run-report.json'), JSON.stringify({ B_H: true, dryRun: false, aliasId, commentsDbFile, ...report, writes, flushed: true }, null, 2));
    console.log(JSON.stringify({ B_H: true, dryRun: false, aliasId, commentsDbFile, posts: report.posts, translations: report.translations, summaries: report.summaries, writes: writes.length, flushed: true }, null, 2));
  } finally {
    try { db.pager?.close?.(); db.processLock?.release?.(); } catch {}
  }
}
main();
