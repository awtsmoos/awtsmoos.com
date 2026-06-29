/* B"H
Benchmark report: raw encoding numbers become readable guidance.
The Awtsmoos lets rows gather without a broken newline vessel.
*/
import { gradeBenchmark, summarizeBenchmark } from './benchmarkGrade.js';
const NL = String.fromCharCode(10);

export function formatSingleBenchmark(result) {
  if (!result.supported) return `Unavailable: ${result.reason}`;
  const grade = result.grade || gradeBenchmark(result);
  return [
    grade.grade, grade.value,
    `${result.encodeFps.toFixed(1)} encode fps · ${result.realtimeFactor.toFixed(2)}× realtime`,
    `${formatBytes(result.bytes)} · ${result.mbps.toFixed(2)} Mbps · ${result.chunks} chunks`,
    `${result.width}×${result.height}@${result.fps} ${result.codec}`
  ].join(NL);
}
export function formatBenchmarkMatrix(matrix) {
  const warnings = matrix.recommendationDetail?.warnings || [];
  return [matrix.recommendation, ...warnings.map(w => `Warning: ${w}`), '', ...matrix.results.map(row)].join(NL);
}
export function publicMatrixJson(matrix) {
  return { recommendation:matrix.recommendation, recommendationDetail:packDetail(matrix.recommendationDetail), best:pack(matrix.best), results:matrix.results.map(pack) };
}
function row(r) { return r.supported ? `${r.label}: ${summarizeBenchmark({ ...r, grade:r.grade || gradeBenchmark(r) })} · ${formatBytes(r.bytes)}` : `${r.label}: unavailable · ${r.reason}`; }
function packDetail(d) { return d && { summary:d.summary, warnings:d.warnings, ranked:d.ranked.map(pack) }; }
function pack(r) {
  if (!r) return null;
  return { id:r.id, label:r.label, supported:r.supported, codec:r.codec, width:r.width, height:r.height, fps:r.fps, encodeFps:r.encodeFps, realtimeFactor:r.realtimeFactor, mbps:r.mbps, bytes:r.bytes, valueScore:r.valueScore, grade:r.grade, reason:r.reason || '' };
}
function formatBytes(bytes) { return bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(2)} MB`; }
