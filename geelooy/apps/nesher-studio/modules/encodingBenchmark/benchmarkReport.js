/* B"H
Benchmark report: raw encoding numbers become readable guidance.
The Awtsmoos lets rows gather without a broken newline vessel.
*/
import { summarizeBenchmark } from './benchmarkGrade.js';
const NL = String.fromCharCode(10);

export function formatSingleBenchmark(result) {
  if (!result.supported) return `Unavailable: ${result.reason}`;
  return [
    result.grade.grade, result.grade.value,
    `${result.encodeFps.toFixed(1)} encode fps · ${result.realtimeFactor.toFixed(2)}× realtime`,
    `${formatBytes(result.bytes)} · ${result.mbps.toFixed(2)} Mbps · ${result.chunks} chunks`,
    `${result.width}×${result.height}@${result.fps} ${result.codec}`
  ].join(NL);
}
export function formatBenchmarkMatrix(matrix) {
  return [matrix.recommendation, '', ...matrix.results.map(row)].join(NL);
}
export function publicMatrixJson(matrix) {
  return { recommendation:matrix.recommendation, best:pack(matrix.best), results:matrix.results.map(pack) };
}
function row(r) {
  if (!r.supported) return `${r.label}: unavailable · ${r.reason}`;
  return `${r.label}: ${summarizeBenchmark(r)} · ${formatBytes(r.bytes)}`;
}
function pack(r) {
  if (!r) return null;
  return { id:r.id, label:r.label, supported:r.supported, codec:r.codec, width:r.width, height:r.height, fps:r.fps, encodeFps:r.encodeFps, realtimeFactor:r.realtimeFactor, mbps:r.mbps, bytes:r.bytes, grade:r.grade, reason:r.reason || '' };
}
function formatBytes(bytes) { return bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(2)} MB`; }
