// B"H
/**
 * @file inspect_real_shapes.mjs
 * @chapter The Ikar Vessels Reveal Their Actual Nested Rooms
 */

import { openLegacyDb, readSeriesPosts } from "./ikar_reader.mjs";
import { extractHebrewSegments } from "./extract_hebrew_segments.mjs";

const ids = process.argv.slice(2);
const db = await openLegacyDb();

function compactPost(post) {
  const segs = extractHebrewSegments(post).slice(0, 12).map(s => ({ path: s.segmentPath, preview: s.hebrewPreview.slice(0, 120) }));
  return {
    title: post?.title,
    topKeys: Object.keys(post || {}),
    dayuhKeys: Object.keys(post?.dayuh || {}),
    sectionsLength: Array.isArray(post?.sections) ? post.sections.length : null,
    dayuhSectionsLength: Array.isArray(post?.dayuh?.sections) ? post.dayuh.sections.length : null,
    nodesLength: Array.isArray(post?.nodes) ? post.nodes.length : null,
    extractedHebrewSegments: segs,
    sample: JSON.stringify(post, null, 2).slice(0, 1800)
  };
}

for (const id of ids) {
  const posts = await readSeriesPosts(db, id);
  const keys = Object.keys(posts || {}).slice(0, 2);
  console.log(JSON.stringify({ seriesId: id, count: Object.keys(posts || {}).length, keys, samples: keys.map(key => ({ postId: key, ...compactPost(posts[key]) })) }, null, 2));
}
