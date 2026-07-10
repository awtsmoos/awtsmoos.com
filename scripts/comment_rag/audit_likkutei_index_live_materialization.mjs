#!/usr/bin/env node
// B"H
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const DB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON');
const root = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const rag = path.join(root, 'ai/comment-rag/likkutei-v01-v39-fast-index');
const corpus = path.join(root, 'socialPacked/social.heichel.ikar.comments.corpus.likkuteiSichos.alias.likkutei_translation_en.v2.fs.awtsdb');
const metaFile = path.join(rag, 'meta.jsonl');
function open(file) {
  const db = new DB(file, { readOnly:true, readonly:true, wal:false, processLockMode:'shared', lockMode:'shared' });
  db.open(); db.fs.ready(); return db;
}
function close(db) { try { db.pager?.close?.(); db.processLock?.release?.(); } catch {} }
function read(db, p) {
  const st = db.fs.stat(p);
  if (!st?.exists || st.type !== 'file' || Number(st.size) <= 1) return null;
  try { return awts.deserializeBinary(db.fs.readRange(p, 0, st.size)); } catch { return null; }
}
function rows(value) {
  if (Array.isArray(value)) return value;
  return Object.entries(value || {}).filter(([k,v]) => /^\d+$/.test(k) && Array.isArray(v)).flatMap(([,v]) => v);
}
function section(row) { return Number(row?.verseSection ?? row?.dayuh?.verseSection); }
function main() {
  const meta = fs.readFileSync(metaFile, 'utf8').trim().split('\n').map(JSON.parse);
  const db = open(corpus), cache = new Map(), volumes = new Map(), bad = [];
  let okRecords = 0, missingRows = 0, missingIds = 0, blankTexts = 0;
  try {
    for (const item of meta) {
      if (!cache.has(item.commentPath)) cache.set(item.commentPath, rows(read(db, item.commentPath)));
      const all = cache.get(item.commentPath) || [];
      const hit = all.filter(row => section(row) >= Number(item.verseStart) && section(row) <= Number(item.verseEnd));
      const ids = new Set(hit.map(row => row?.id).filter(Boolean));
      const expected = (item.commentIds || []).filter(Boolean);
      const missing = expected.filter(id => !ids.has(id));
      const blanks = hit.filter(row => !String(row?.content || '').trim()).length;
      const issue = !hit.length ? 'zero_rows_in_range' : blanks ? 'blank_text_in_range' : missing.length ? 'missing_expected_ids' : null;
      const stat = volumes.get(item.volume) || { volume:item.volume, records:0, ok:0, bad:0, rows:0, missingIds:0, blanks:0 };
      stat.records++; stat.rows += hit.length; stat.missingIds += missing.length; stat.blanks += blanks;
      if (issue) {
        stat.bad++; missingRows += !hit.length ? 1 : 0; missingIds += missing.length; blankTexts += blanks;
        if (bad.length < 100) bad.push({ id:item.id, volume:item.volume, postId:item.postId, issue, rows:hit.length, missingIds:missing.length, blanks });
      } else { stat.ok++; okRecords++; }
      volumes.set(item.volume, stat);
    }
  } finally { close(db); }
  const volumeStats = [...volumes.values()].sort((a,b) => a.volume - b.volume);
  console.log(JSON.stringify({ records:meta.length, okRecords, badRecords:meta.length-okRecords, missingRows, missingIds, blankTexts, all39VolumesPresent:volumeStats.length===39, volumeStats, badSamples:bad }, null, 2));
}
main();
