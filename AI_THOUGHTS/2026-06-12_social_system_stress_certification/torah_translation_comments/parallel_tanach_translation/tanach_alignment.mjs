//B"H
/**
 * @module tanachAlignment
 * @description Aligns social chapter sections with Tanach.json native English.
 */
import fs from 'node:fs';
import { BOOKS, TANACH_PATH } from './config.mjs';
import { socialVerseUnits } from './social_corpus.mjs';

export function normalizeHebrew(text = '') {
  return String(text).replace(/<[^>]+>/g, '').replace(/[\u0591-\u05C7]/g, '').replace(/[\s׀|־:]/g, '').trim();
}

export function cleanText(text = '') {
  return String(text).replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

export function loadTanach() {
  return JSON.parse(fs.readFileSync(TANACH_PATH, 'utf8'));
}

function verseFrom(article, index) {
  const verse = article?.data?.body?.verses?.[index];
  return {
    tanachArticleId: article?.data?.body?.['article-id'],
    tanachVerseIndex: index,
    tanachVerseNumber: verse?.native?.number || verse?.hebrew?.number || String(index + 1),
    tanachHebrew: cleanText(verse?.hebrew?.text || ''),
    nativeEnglish: cleanText(verse?.native?.text || '')
  };
}

function scoreArticle(job, article) {
  const units = socialVerseUnits(job);
  const verses = article?.data?.body?.verses || [];
  let score = verses.length === units.length ? 3 : 0;
  for (let i = 0; i < Math.min(units.length, verses.length, 4); i++) {
    if (normalizeHebrew(units[i].hebrew) === normalizeHebrew(verses[i]?.hebrew?.text)) score += 5;
  }
  return score;
}

export function findTanachArticle(tanach, job) {
  const expected = BOOKS[job.series]?.tanachStart + job.chapter - 1;
  const candidates = [];
  for (let i = Math.max(0, expected - 2); i <= Math.min(tanach.length - 1, expected + 2); i++) {
    candidates.push({ index: i, score: scoreArticle(job, tanach[i]) });
  }
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (!best || best.score < 8) throw new Error(`Could not align ${job.series} chapter ${job.chapter}`);
  return { index: best.index, article: tanach[best.index], score: best.score, expected };
}

export function alignJob(tanach, job) {
  const match = findTanachArticle(tanach, job);
  const units = socialVerseUnits(job).map((unit, index) => ({
    ...unit,
    ...verseFrom(match.article, index),
    tanachArticleIndex: match.index,
    tanachAlignmentScore: match.score,
    tanachExpectedIndex: match.expected
  }));
  return { ...job, tanachArticleIndex: match.index, tanachAlignmentScore: match.score, units };
}
