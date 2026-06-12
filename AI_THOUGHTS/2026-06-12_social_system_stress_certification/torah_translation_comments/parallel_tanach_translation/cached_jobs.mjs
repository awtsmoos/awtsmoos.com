//B"H
/**
 * @module cachedAlignedJobs
 * @description Rebuilds translation jobs from saved alignment plus Tanach.json.
 */
import fs from 'node:fs';
import { HEICHEL_ID } from './config.mjs';
import { cleanText } from './tanach_alignment.mjs';

export function jobsFromAlignedFile(tanach, file) {
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
  return rows.map(row => {
    const article = tanach[row.tanachArticleIndex];
    const verses = article?.data?.body?.verses || [];
    const units = verses.slice(0, row.verses).map((verse, index) => ({
      book: row.series,
      chapter: row.chapter,
      heichelId: HEICHEL_ID,
      seriesId: row.series,
      postId: row.postId,
      verseIndex: index + 1,
      verseSection: `verse-${index + 1}`,
      hebrew: cleanText(verse?.hebrew?.text || ''),
      tanachArticleIndex: row.tanachArticleIndex,
      tanachArticleId: article?.data?.body?.['article-id'],
      tanachVerseIndex: index,
      tanachVerseNumber: verse?.native?.number || verse?.hebrew?.number || String(index + 1),
      tanachHebrew: cleanText(verse?.hebrew?.text || ''),
      nativeEnglish: cleanText(verse?.native?.text || ''),
      tanachAlignmentScore: 999,
      tanachExpectedIndex: row.tanachArticleIndex
    })).filter(unit => unit.hebrew.trim());
    return { series: row.series, book: row.series, chapter: row.chapter, postId: row.postId, title: `Chapter ${row.chapter}`, tanachArticleIndex: row.tanachArticleIndex, tanachAlignmentScore: 999, units };
  });
}
