// B"H
/** Maps an embedded segment back to the exact source comments that compose it. */
function plain(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}
function contentOf(row) { return row?.content || row?.text || row?.body || ''; }
function words(value) { return plain(value).split(' ').filter(Boolean); }
function overlap(segmentWords, commentWords) {
  if (!commentWords.length) return 0;
  const segment = new Set(segmentWords);
  let shared = 0;
  for (const word of commentWords) if (segment.has(word)) shared++;
  return shared / commentWords.length;
}
function score(segmentText, segmentWords, row, index) {
  const text = plain(contentOf(row));
  const commentWords = text.split(' ').filter(Boolean);
  const substantial = text.length >= 12 || commentWords.length >= 3;
  return {
    row,
    index,
    text,
    contained:substantial && segmentText.includes(text),
    coverage:overlap(segmentWords, commentWords)
  };
}
function exactSpan(scored) {
  const exact = scored.filter(item => item.contained);
  if (!exact.length) return [];
  const first = exact[0].index;
  const last = exact[exact.length - 1].index;
  const span = scored.slice(first, last + 1).filter(item => item.contained || item.coverage >= .82);
  const before = scored[first - 1];
  const after = scored[last + 1];
  if (before?.coverage >= .82 && before.text.length >= 12) span.unshift(before);
  if (after?.coverage >= .82 && after.text.length >= 12) span.push(after);
  return span;
}
function bestFallback(scored, maxRows) {
  return [...scored]
    .filter(item => item.text.length >= 12)
    .sort((a,b) => b.coverage - a.coverage)
    .slice(0, Math.min(maxRows, 6))
    .sort((a,b) => a.index - b.index);
}
function commentsForSegment(rows, segment, maxRows=25) {
  const segmentText = plain(segment);
  if (!segmentText) return rows.slice(0, maxRows).map(row => ({ ...row, segmentMatch:false, overlap:0 }));
  const segmentWords = words(segmentText);
  const scored = rows.map((row, index) => score(segmentText, segmentWords, row, index));
  const exact = exactSpan(scored);
  const chosen = (exact.length ? exact : bestFallback(scored, maxRows)).slice(0, maxRows);
  return chosen.map(item => ({ ...item.row, segmentMatch:item.contained, overlap:Number(item.coverage.toFixed(4)) }));
}
module.exports = { commentsForSegment, plain, contentOf };
