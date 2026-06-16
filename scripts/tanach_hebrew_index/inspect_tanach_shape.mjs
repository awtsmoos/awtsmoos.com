// B"H
/**
 * @file inspect_tanach_shape.mjs
 * @chapter Before Indexing The Scroll Is Counted With Awe
 * @description Compactly verifies Tanach.json shape without printing the giant source.
 */

import { readTanach, inspectTanach } from "./tanach_reader.mjs";

const tanach = readTanach();
const info = inspectTanach(tanach);

console.log(JSON.stringify({
  ok: info.chapters === 929,
  chapters: info.chapters,
  verses: info.verses,
  firstRef: info.first && {
    book: info.first.book,
    chapter: info.first.chapter,
    verse: info.first.verse,
    preview: info.first.hebrewPreview
  },
  lastRef: info.last && {
    book: info.last.book,
    chapter: info.last.chapter,
    verse: info.last.verse,
    preview: info.last.hebrewPreview
  },
  sampleNormalizedTokens: info.sampleTokens
}, null, 2));
