#!/usr/bin/env node
// B"H
/**
 * Verify Sefer HaSichos Hebrew posts and English comment alignment in the live DB.
 * Read-only. Does not build embeddings.
 *
 * Comment row subSection values are 1-based in the observed Sefer HaSichos data,
 * while post.dayuh.sections arrays are 0-based. The verifier therefore checks
 * subSection - 1 first, then subSection as a defensive fallback.
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
const SERIES_ROOT = path.join(DB_ROOT, 'social/heichelos/ikar/series');
const CANONICAL_ALIAS = 'sefer_hasichos_translation_en';
const RUN = path.join(RAG, `verify_sefer_hasichos_live_alignment_${new Date().toISOString().replace(/[:.]/g, '-')}`);

function openCommentsDb() {
  const db = new AwtsmoosDB(COMMENTS_DB, { debug: false, readOnly: true, processLockMode: 'shared', lockMode: 'shared' });
  db.open();
  return db;
}
function closeDb(db) { try { db.pager?.close?.(); db.processLock?.release?.(); } catch {} }
function safeLs(db, p) { try { return db.fs.ls(p) || []; } catch { return []; } }
function safeStat(db, p) { try { return db.fs.stat(p); } catch { return null; } }
function decodeBuffer(buffer) {
  if (!Buffer.isBuffer(buffer)) return { ok: false, reason: 'not_buffer' };
  try { return { ok: true, obj: legacy.deserializeBinary(buffer), encoding: 'awtsmoosBinary' }; } catch {}
  try { return { ok: true, obj: JSON.parse(buffer.toString('utf8')), encoding: 'json' }; } catch {}
  return { ok: false, reason: 'undecodable', firstBytes: Array.from(buffer.subarray(0, 16)), preview: buffer.toString('utf8', 0, 80) };
}
function readPackedObject(db, p) {
  const stat = safeStat(db, p);
  if (!stat?.exists) return { ok: false, reason: 'missing' };
  return decodeBuffer(db.fs.cat(p));
}
function numericKeys(obj) {
  return Object.keys(obj || {}).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
}
function rows(obj) { return numericKeys(obj).flatMap(k => Array.isArray(obj[k]) ? obj[k] : []); }
function countPostPhrases(post) { return (post?.dayuh?.sections || []).reduce((n, sec) => n + (Array.isArray(sec) ? sec.length : 0), 0); }
function normalize(x) { return String(x || '').replace(/<[^>]+>/g, '').replace(/&lt;[^&]*?&gt;/g, '').replace(/\s+/g, ' ').trim(); }
function rowSourceHebrew(row) { return row?.sourceHebrew || row?.dayuh?.sourceHebrew || ''; }
function rowSection(row) { return Number(row?.verseSection ?? row?.dayuh?.verseSection); }
function rowSubsection(row) { return Number(row?.subSection ?? row?.dayuh?.subSection); }
function discoverSeries() { return fs.readdirSync(SERIES_ROOT).filter(n => /^seferHaSichos\d+$/i.test(n)).sort(); }
function postBranches(db, seriesId) {
  const base = `/social/heichelos/ikar/comments/atSeries/${seriesId}/atPost`;
  return safeLs(db, base).filter(x => !x.endsWith('.awtsmoosJSON')).sort();
}
function aliasesFor(db, seriesId, postId) {
  return safeLs(db, `/social/heichelos/ikar/comments/atSeries/${seriesId}/atPost/${postId}`).sort();
}
function chooseAlias(aliases) {
  if (aliases.includes(CANONICAL_ALIAS)) return CANONICAL_ALIAS;
  if (aliases.includes(`${CANONICAL_ALIAS}.awtsmoosJSON`)) return `${CANONICAL_ALIAS}.awtsmoosJSON`;
  return aliases.find(a => a.includes('translation_en')) || aliases[0] || null;
}
function postHebrewAt(post, sec, sub) {
  const section = post?.dayuh?.sections?.[sec];
  if (!Array.isArray(section)) return '';
  const candidates = [];
  if (Number.isFinite(sub)) candidates.push(sub - 1, sub);
  for (const idx of candidates) {
    if (idx >= 0 && idx < section.length) {
      const text = normalize(section[idx]);
      if (text) return text;
    }
  }
  return '';
}
function sectionContainsHebrew(post, sec, he) {
  const section = post?.dayuh?.sections?.[sec];
  if (!Array.isArray(section) || !he) return false;
  return section.some(phrase => normalize(phrase) === he);
}
function auditRows(post, commentRows) {
  let rowsWithEnglish = 0;
  let rowsWithSourceHebrew = 0;
  let rowsMatchingHebrewSlot = 0;
  let rowsMatchingHebrewSection = 0;
  for (const row of commentRows) {
    const en = normalize(row?.content);
    const he = normalize(rowSourceHebrew(row));
    if (en) rowsWithEnglish += 1;
    if (he) rowsWithSourceHebrew += 1;
    const sec = rowSection(row);
    const sub = rowSubsection(row);
    const slotHe = postHebrewAt(post, sec, sub);
    if (he && slotHe && he === slotHe) rowsMatchingHebrewSlot += 1;
    if (he && sectionContainsHebrew(post, sec, he)) rowsMatchingHebrewSection += 1;
  }
  return { rowsWithEnglish, rowsWithSourceHebrew, rowsMatchingHebrewSlot, rowsMatchingHebrewSection };
}

async function main() {
  fs.mkdirSync(RUN, { recursive: true });
  const dos = new DosDB(DB_ROOT);
  await dos.init?.();
  const cdb = openCommentsDb();
  const result = {
    BH: 'B"H',
    run: RUN,
    dbRoot: DB_ROOT,
    commentsDb: COMMENTS_DB,
    canonicalAlias: CANONICAL_ALIAS,
    series: [],
    totals: {
      series: 0,
      hebrewPosts: 0,
      commentPosts: 0,
      readableCommentBranches: 0,
      unreadableCommentBranches: 0,
      missingCommentPosts: 0,
      extraCommentPosts: 0,
      commentRows: 0,
      rowsWithEnglish: 0,
      rowsWithSourceHebrew: 0,
      rowsMatchingHebrewSlot: 0,
      rowsMatchingHebrewSection: 0,
      postsWithFullEnglishAndSourceHebrew: 0,
      postsWithPerfectHebrewSlotMatch: 0,
      postsWithPerfectHebrewSectionMatch: 0
    },
    issueSamples: []
  };

  try {
    for (const seriesId of discoverSeries()) {
      const posts = await dos.get(`/social/heichelos/ikar/series/${seriesId}/posts`).catch(() => null);
      const postIds = posts && typeof posts === 'object' && !Array.isArray(posts) ? Object.keys(posts).filter(k => posts[k] && typeof posts[k] === 'object').sort() : [];
      const commentPostIds = postBranches(cdb, seriesId);
      const commentSet = new Set(commentPostIds);
      const postSet = new Set(postIds);
      const missingCommentPosts = postIds.filter(id => !commentSet.has(id));
      const extraCommentPosts = commentPostIds.filter(id => !postSet.has(id));
      const stat = {
        seriesId,
        hebrewPosts: postIds.length,
        commentPosts: commentPostIds.length,
        missingCommentPosts: missingCommentPosts.length,
        extraCommentPosts: extraCommentPosts.length,
        aliasCounts: {},
        readableCommentBranches: 0,
        unreadableCommentBranches: 0,
        commentRows: 0,
        rowsWithEnglish: 0,
        rowsWithSourceHebrew: 0,
        rowsMatchingHebrewSlot: 0,
        rowsMatchingHebrewSection: 0,
        postsWithFullEnglishAndSourceHebrew: 0,
        postsWithPerfectHebrewSlotMatch: 0,
        postsWithPerfectHebrewSectionMatch: 0,
        sampleIssues: []
      };
      for (const id of missingCommentPosts.slice(0, 10)) stat.sampleIssues.push({ postId: id, issue: 'missing_comment_post' });
      for (const id of extraCommentPosts.slice(0, 10)) stat.sampleIssues.push({ postId: id, issue: 'extra_comment_post_without_hebrew_post' });

      for (const postId of commentPostIds) {
        const aliases = aliasesFor(cdb, seriesId, postId);
        for (const alias of aliases) stat.aliasCounts[alias] = (stat.aliasCounts[alias] || 0) + 1;
        const alias = chooseAlias(aliases);
        if (!alias) {
          stat.unreadableCommentBranches += 1;
          if (result.issueSamples.length < 40) result.issueSamples.push({ seriesId, postId, issue: 'no_alias' });
          continue;
        }
        const commentPath = `/social/heichelos/ikar/comments/atSeries/${seriesId}/atPost/${postId}/${alias}`;
        const decoded = readPackedObject(cdb, commentPath);
        if (!decoded.ok) {
          stat.unreadableCommentBranches += 1;
          const issue = { seriesId, postId, alias, commentPath, issue: decoded.reason, firstBytes: decoded.firstBytes, preview: decoded.preview };
          stat.sampleIssues.push(issue);
          if (result.issueSamples.length < 40) result.issueSamples.push(issue);
          continue;
        }
        const commentRows = rows(decoded.obj);
        const post = posts?.[postId] || null;
        const rowAudit = auditRows(post, commentRows);
        stat.readableCommentBranches += 1;
        stat.commentRows += commentRows.length;
        stat.rowsWithEnglish += rowAudit.rowsWithEnglish;
        stat.rowsWithSourceHebrew += rowAudit.rowsWithSourceHebrew;
        stat.rowsMatchingHebrewSlot += rowAudit.rowsMatchingHebrewSlot;
        stat.rowsMatchingHebrewSection += rowAudit.rowsMatchingHebrewSection;
        if (commentRows.length && rowAudit.rowsWithEnglish === commentRows.length && rowAudit.rowsWithSourceHebrew === commentRows.length) stat.postsWithFullEnglishAndSourceHebrew += 1;
        if (commentRows.length && rowAudit.rowsMatchingHebrewSlot === commentRows.length) stat.postsWithPerfectHebrewSlotMatch += 1;
        if (commentRows.length && rowAudit.rowsMatchingHebrewSection === commentRows.length) stat.postsWithPerfectHebrewSectionMatch += 1;
        if (post && countPostPhrases(post) && commentRows.length && rowAudit.rowsMatchingHebrewSlot !== commentRows.length && stat.sampleIssues.length < 10) {
          stat.sampleIssues.push({ seriesId, postId, alias, issue: 'hebrew_slot_mismatch', rows: commentRows.length, rowsMatchingHebrewSlot: rowAudit.rowsMatchingHebrewSlot, rowsMatchingHebrewSection: rowAudit.rowsMatchingHebrewSection, postPhrases: countPostPhrases(post) });
        }
      }

      result.series.push(stat);
      result.totals.series += 1;
      for (const key of ['hebrewPosts','commentPosts','readableCommentBranches','unreadableCommentBranches','missingCommentPosts','extraCommentPosts','commentRows','rowsWithEnglish','rowsWithSourceHebrew','rowsMatchingHebrewSlot','rowsMatchingHebrewSection','postsWithFullEnglishAndSourceHebrew','postsWithPerfectHebrewSlotMatch','postsWithPerfectHebrewSectionMatch']) {
        result.totals[key] += stat[key];
      }
    }
  } finally {
    closeDb(cdb);
  }

  result.readyForEmbedding = result.totals.missingCommentPosts === 0 && result.totals.unreadableCommentBranches === 0 && result.totals.commentRows > 0 && result.totals.commentRows === result.totals.rowsWithEnglish && result.totals.commentRows === result.totals.rowsWithSourceHebrew;
  result.hebrewSlotAlignmentReady = result.totals.commentRows > 0 && result.totals.commentRows === result.totals.rowsMatchingHebrewSlot;
  fs.writeFileSync(path.join(RUN, 'summary.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({
    run: result.run,
    readyForEmbedding: result.readyForEmbedding,
    hebrewSlotAlignmentReady: result.hebrewSlotAlignmentReady,
    totals: result.totals,
    series: result.series.map(s => ({ seriesId: s.seriesId, hebrewPosts: s.hebrewPosts, commentPosts: s.commentPosts, missingCommentPosts: s.missingCommentPosts, extraCommentPosts: s.extraCommentPosts, readableCommentBranches: s.readableCommentBranches, unreadableCommentBranches: s.unreadableCommentBranches, commentRows: s.commentRows, rowsWithEnglish: s.rowsWithEnglish, rowsWithSourceHebrew: s.rowsWithSourceHebrew, rowsMatchingHebrewSlot: s.rowsMatchingHebrewSlot, rowsMatchingHebrewSection: s.rowsMatchingHebrewSection, aliasCounts: s.aliasCounts, sampleIssues: s.sampleIssues.slice(0, 3) })),
    issueSamples: result.issueSamples.slice(0, 10)
  }, null, 2));
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
