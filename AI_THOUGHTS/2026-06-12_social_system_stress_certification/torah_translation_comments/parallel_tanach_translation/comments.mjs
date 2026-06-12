//B"H
/**
 * @module translationComments
 * @description Writes authoritative imported-Tanach verse comments directly.
 */
import { HEICHEL_ID, PROMPT_VERSION, TRANSLATION_ALIAS, TRANSLATION_USER, DIVINE_NAME_POLICY } from './config.mjs';
import { alignmentHash, sourceHash } from './hash.mjs';

function parseDayuh(dayuh) {
  if (!dayuh) return null;
  if (typeof dayuh === 'object') return dayuh;
  try { return JSON.parse(dayuh); } catch { return null; }
}

export function storageVerseKey(unit) {
  return String(Math.max(0, Number(unit.verseIndex || 1) - 1));
}

export async function ensureTranslationAlias(db) {
  const path = `/social/aliases/${TRANSLATION_ALIAS}/info`;
  const current = await db.read(path);
  if (current?.id || current?.aliasId) return current;
  const info = { id: TRANSLATION_ALIAS, aliasId: TRANSLATION_ALIAS, name: 'Torah Translation English', description: 'English Tanach translation comments refined by Minimax.', owner: TRANSLATION_USER, createdAt: Date.now() };
  await db.write(path, info);
  return info;
}

export async function existingHashes(db, job) {
  const found = new Map();
  const path = `/social/heichelos/${HEICHEL_ID}/comments/atSeries/${job.series}/atPost/${job.postId}/${TRANSLATION_ALIAS}`;
  const existing = await db.read(path);
  for (const [section, comments] of Object.entries(existing || {})) {
    for (const comment of Array.isArray(comments) ? comments : []) {
      const dayuh = parseDayuh(comment.dayuh);
      if (dayuh?.translation && dayuh.language === 'en') {
        found.set(`${section}:ANY`, comment.id || true);
        if (dayuh.sourceHash) found.set(`${section}:${dayuh.sourceHash}`, comment.id || true);
      }
    }
  }
  return found;
}

export function dayuhFor(job, unit, english, batchId) {
  return { verseSection: Number(storageVerseKey(unit)), sourceVerseSection: unit.verseSection, translation: true, language: 'en', source: 'minimax', sourceHash: sourceHash(unit), alignmentHash: alignmentHash(unit), promptVersion: PROMPT_VERSION, batchId, modelAlias: 'minimax-deep', sourceBook: job.series, sourceChapter: job.chapter, sourcePostId: job.postId, tanachAlignment: { articleIndex: unit.tanachArticleIndex, articleId: unit.tanachArticleId, verseIndex: unit.tanachVerseIndex, verseNumber: unit.tanachVerseNumber, score: unit.tanachAlignmentScore }, existingEnglishSource: 'Tanach.json native.text', existingEnglishPreview: (unit.nativeEnglish || '').slice(0, 220), hebrewPreview: unit.hebrew.slice(0, 220), englishPreview: english.slice(0, 220), divineNamePolicy: DIVINE_NAME_POLICY };
}

async function indexAlias(db, job) {
  const atPostPath = `/social/aliases/${TRANSLATION_ALIAS}/comments/heichel/${HEICHEL_ID}/series/${job.series}/atPost`;
  const existing = await db.read(atPostPath);
  await db.write(atPostPath, { ...(existing && typeof existing === 'object' ? existing : {}), [job.postId]: true });
}

export async function writeComment({ db, job, unit, english, batchId }) {
  const commentId = `BH_${Date.now()}_commentBy_${TRANSLATION_ALIAS}_${unit.verseIndex}`;
  const shtar = { id: commentId, author: TRANSLATION_ALIAS, parentType: 'post', parentId: job.postId, seriesId: job.series, verseSection: Number(storageVerseKey(unit)), content: english, dayuh: dayuhFor(job, unit, english, batchId) };
  const path = `/social/heichelos/${HEICHEL_ID}/comments/atSeries/${job.series}/atPost/${job.postId}/${TRANSLATION_ALIAS}`;
  const result = await db.appendToArrayAtKey(path, { key: storageVerseKey(unit), shtar });
  if (result?.error) throw new Error(`DB append failed: ${JSON.stringify(result.error)}`);
  await indexAlias(db, job);
  return commentId;
}

export async function verifyWrite(db, job, unit) {
  const found = await existingHashes(db, job);
  return found.get(`${storageVerseKey(unit)}:${sourceHash(unit)}`) || found.get(`${storageVerseKey(unit)}:ANY`) || null;
}
