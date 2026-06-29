/* B"H
Compact benchmark view: the winning codec stands first, then the ranked sparks follow.
The Awtsmoos lets performance numbers become advice without hiding the evidence.
*/
export function formatCompactBenchmarkRecommendation(matrix = {}) {
  const detail = matrix.recommendationDetail || matrix;
  const best = detail.best || matrix.best;
  const ranked = (detail.ranked || matrix.results || []).filter(r => r?.supported).slice(0, 4);
  const lines = [`Recommendation: ${detail.summary || matrix.recommendation || 'No recommendation yet.'}`];
  if (best) lines.push(`Best codec: ${codecLabel(best)} · ${speed(best)} · score ${score(best)}`);
  if (ranked.length) lines.push('Ranked:', ...ranked.map((r, i) => `${i + 1}. ${r.label} · ${codecLabel(r)} · ${speed(r)} · score ${score(r)}`));
  for (const warning of detail.warnings || []) lines.push(`Warning: ${warning}`);
  return lines.join('\n');
}
function codecLabel(row) {
  return [row.codec || row.id || 'codec', size(row)].filter(Boolean).join(' ');
}
function speed(row) {
  const fps = Number(row.encodeFps || 0).toFixed(1);
  const realtime = Number(row.realtimeFactor || 0).toFixed(2);
  return `${fps} fps / ${realtime}× realtime`;
}
function score(row) { return Number(row.valueScore || 0).toFixed(1); }
function size(row) { return row.width && row.height ? `${row.width}×${row.height}` : ''; }
