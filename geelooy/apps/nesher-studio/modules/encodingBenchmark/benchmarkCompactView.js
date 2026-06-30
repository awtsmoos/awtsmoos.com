/* B"H
Compact benchmark view: best codec first, then ranked speed and realtime truth.
*/
export function formatCompactBenchmarkRecommendation(matrix = {}) {
  const detail = matrix.recommendationDetail || matrix, best = detail.best || matrix.best;
  const ranked = (detail.ranked || matrix.results || []).filter(r => r?.supported).slice(0, 4), lines = [`Recommendation: ${detail.summary || matrix.recommendation || 'No recommendation yet.'}`];
  if (best) lines.push(`Best codec: ${codecLabel(best)} · ${speed(best)} · score ${score(best)} · ${suitable(best)}`);
  if (ranked.length) lines.push('Ranked:', ...ranked.map((r, i) => `${i + 1}. ${r.label} · ${codecLabel(r)} · ${speed(r)} · score ${score(r)} · ${suitable(r)}`));
  for (const warning of detail.warnings || []) lines.push(`Warning: ${warning}`);
  return lines.join('\n');
}
function codecLabel(row) { return [row.codec || row.id || 'codec', size(row)].filter(Boolean).join(' '); }
function speed(row) { return `${Number(row.encodeFps || 0).toFixed(1)} fps / ${Number(row.realtimeFactor || 0).toFixed(2)}× realtime`; }
function score(row) { return Number(row.valueScore || 0).toFixed(1); }
function suitable(row) { return (row.realtimeSuitable ?? row.realtimeFactor >= 1) ? 'realtime yes' : 'realtime no'; }
function size(row) { return row.width && row.height ? `${row.width}×${row.height}` : ''; }
