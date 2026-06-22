/**
 * B"H
 * Chapter 409: The cleaner only removes dust it can name.
 *
 * This scanner looks for invalid post references in each series posts array. It
 * does not delete Torah content. Garbage means only empty/null/literal undefined
 * references or duplicate references inside the same series list.
 */

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB');
const db = new DosDB('/Users/awtsmoos/Documents/awtsmoos/dayuhChadash');
const ids = await db.get('social/heichelos/ikar/series') || [];
const problems = [];
for (const seriesId of ids) {
  const key = `social/heichelos/ikar/series/${seriesId}/posts`;
  const posts = await db.get(key);
  if (!Array.isArray(posts)) continue;
  const seen = new Set();
  const bad = [];
  const duplicates = [];
  for (const postId of posts) {
    const text = String(postId ?? '').trim();
    if (!text || text === 'undefined' || text === 'null') bad.push(postId);
    else if (seen.has(text)) duplicates.push(text);
    else seen.add(text);
  }
  if (bad.length || duplicates.length) problems.push({ seriesId, key, total: posts.length, bad, duplicates });
}
console.log(JSON.stringify({ BH: 'B"H', scannedSeries: ids.length, problems }, null, 2));
