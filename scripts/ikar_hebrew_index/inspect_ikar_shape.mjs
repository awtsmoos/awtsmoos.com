// B"H
/**
 * @file inspect_ikar_shape.mjs
 * @chapter The Heichel Is Counted Before It Is Indexed
 */

import { listSeriesIds, iterateIkarSegments } from "./ikar_reader.mjs";

const series = listSeriesIds();
const counts = { series: series.length, segments: 0, byCategory: {}, samples: [] };

for await (const segment of iterateIkarSegments()) {
  if (segment.error) continue;
  counts.segments++;
  counts.byCategory[segment.category] = (counts.byCategory[segment.category] || 0) + 1;
  if (counts.samples.length < 8) counts.samples.push({
    category: segment.category,
    seriesId: segment.seriesId,
    postId: segment.postId,
    title: segment.postTitle,
    path: segment.segmentPath,
    preview: segment.hebrewPreview
  });
}

console.log(JSON.stringify(counts, null, 2));
