/* B"H
Benchmark recommendation: a matrix becomes one practical next move, not raw thunder.
*/
import { gradeBenchmark } from './benchmarkGrade.js';
export function benchmarkValueScore(result) {
  if (!result?.supported) return 0;
  const grade = (result.grade || gradeBenchmark(result)).score || 0, realtime = Math.min(8, Number(result.realtimeFactor || 0));
  const pixels = (result.width || 1) * (result.height || 1) / (640 * 360), realtimeBonus = isRealtimeSuitable(result) ? 14 : -16;
  return grade + realtime * 8 + realtimeBonus + Math.min(18, pixels * 4) - Math.max(0, (result.mbps || 0) - 8);
}
export function isRealtimeSuitable(result, floor = 1) { return !!result?.supported && Number(result.realtimeFactor || 0) >= floor; }
export function buildBenchmarkRecommendation(results = []) {
  const ranked = results.filter(r => r.supported).map(enrich).sort((a, b) => b.valueScore - a.valueScore);
  if (!ranked.length) return { summary:'No supported browser encoder scenario completed.', best:null, warnings:['WebCodecs video encoding unavailable in this environment.'], ranked:[] };
  const best = ranked[0], warnings = ranked.filter(r => !r.realtimeSuitable).map(r => `${r.label} is below realtime.`);
  return { summary:`Use ${best.label}: ${best.encodeFps.toFixed(1)} fps, ${best.realtimeFactor.toFixed(2)}× realtime, ${best.grade.grade}, score ${best.valueScore.toFixed(1)}.`, best, warnings, ranked };
}
function enrich(result) { const grade = result.grade || gradeBenchmark(result); return { ...result, grade, realtimeSuitable:isRealtimeSuitable(result), valueScore:benchmarkValueScore({ ...result, grade }) }; }
