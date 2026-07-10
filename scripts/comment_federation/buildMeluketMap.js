#!/usr/bin/env node
// B"H
const fs = require('fs');
const path = require('path');
const DB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON');
const root = path.resolve(__dirname, '../../../../dayuhChadash/socialPacked');
const postsFile = path.join(root, 'social.heichel.ikar.posts.fs.awtsdb');
const commentsFile = path.join(root, 'social.heichel.ikar.comments.fs.awtsdb');
const output = path.join(root, 'meluket-post-map.v1.json');
const months = {
  'אדר':'אדר', 'אייר':'אייר', 'אלול':'אלול', 'חשון':'חשון',
  'טבת':'טבת', 'כסלו':'כסלו', 'מנחם-אב':'מנחם אב', 'ניסן':'ניסן',
  'סיון':'סיון', 'שבט':'שבט', 'תמוז':'תמוז', 'תשרי':'תשרי'
};
function open(file) {
  const db = new DB(file, { readOnly:true, readonly:true, wal:false, processLockMode:'shared', lockMode:'shared' });
  db.open(); db.fs.ready(); return db;
}
function close(db) { try { db.pager?.close?.(); db.processLock?.release?.(); } catch {} }
function read(db, p) {
  const stat = db.fs.stat(p);
  if (!stat?.exists || Number(stat.size) <= 1) return null;
  return awts.deserializeBinary(db.fs.readRange(p, 0, stat.size));
}
function stamp(id) { return Number(String(id).match(/BH_POST_(\d+)/)?.[1] || 0); }
function oldPosts(db, series) {
  const prefix = `/social/heichelos/ikar/comments/atSeries/${series}/atPost/`;
  return [...new Set(Object.values(db.__fs3Manifest.inodes || {})
    .map(x => x?.path || '').filter(p => p.startsWith(prefix) && p.endsWith('/meluket_translation_en'))
    .map(p => p.slice(prefix.length).split('/')[0]))].sort((a,b) => stamp(a)-stamp(b));
}
function main() {
  const posts = open(postsFile), comments = open(commentsFile), entries = {};
  try {
    for (const [month, oldMonth] of Object.entries(months)) {
      const seriesId = `BH-seferHamaamarimMeluket-${month}`;
      const oldSeriesId = `${oldMonth}_meluket`;
      const bundle = read(posts, `/social/heichelos/ikar/series/${seriesId}/posts.awtsmoosJSON`) || {};
      const current = Object.keys(bundle).filter(k => k !== '$awtsmoosObjectShape').sort((a,b) => stamp(a)-stamp(b));
      const old = oldPosts(comments, oldSeriesId);
      if (current.length !== old.length) throw new Error(`Count mismatch ${seriesId}: ${current.length}/${old.length}`);
      current.forEach((postId, index) => { entries[`${seriesId}\0${postId}`] = { oldSeriesId, oldPostId:old[index], title:bundle[postId]?.title || '', index }; });
    }
  } finally { close(posts); close(comments); }
  const report = { version:1, generatedAt:new Date().toISOString(), entries, count:Object.keys(entries).length };
  if (report.count !== 218) throw new Error(`Expected 218 mappings, got ${report.count}`);
  fs.writeFileSync(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ output, count:report.count }, null, 2));
}
main();
