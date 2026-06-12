//B"H
/**
 * @module socialCorpus
 * @description Reads the real social Torah chapter posts through DosDB.
 */
import { HEICHEL_ID } from './config.mjs';

export function parseArgs() {
  const map = new Map();
  for (const raw of process.argv.slice(2)) {
    const [key, ...rest] = raw.replace(/^--/, '').split('=');
    map.set(key, rest.length ? rest.join('=') : 'true');
  }
  return {
    write: map.get('write') === 'true',
    force: map.get('force') === 'true',
    books: (map.get('books') || 'bereishis,tehillim').split(',').filter(Boolean),
    chapters: Number(map.get('chapters') || 5),
    parallel: Math.max(1, Number(map.get('parallel') || 2)),
    chunkVerses: Math.max(1, Number(map.get('chunk-verses') || 6)),
    maxVerses: Number(map.get('max-verses-per-chapter') || 0),
    alignedJobs: map.get('aligned-jobs') || '',
    minimaxOnly: map.get('minimax-only') === 'true'
  };
}

export function orderedPosts(posts) {
  return Object.values(posts || {}).sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
}

export async function discoverSocialChapters(db, options) {
  const jobs = [];
  for (const series of options.books) {
    const posts = await db.read(`/social/heichelos/${HEICHEL_ID}/series/${series}/posts`);
    for (const post of orderedPosts(posts).slice(0, options.chapters)) {
      const chapter = Number(String(post.title || '').match(/\d+/)?.[0] || jobs.length + 1);
      const sections = Array.isArray(post.dayuh?.sections) ? post.dayuh.sections : [];
      const chosen = options.maxVerses > 0 ? sections.slice(0, options.maxVerses) : sections;
      jobs.push({ series, book: series, chapter, postId: post.id || post.postId, title: post.title, sections: chosen });
    }
  }
  return jobs.filter(job => job.sections.length);
}

export function socialVerseUnits(job) {
  return job.sections.map((hebrew, index) => ({
    book: job.series,
    chapter: job.chapter,
    heichelId: HEICHEL_ID,
    seriesId: job.series,
    postId: job.postId,
    verseIndex: index + 1,
    verseSection: `verse-${index + 1}`,
    hebrew: String(hebrew || '')
  })).filter(unit => unit.hebrew.trim());
}
