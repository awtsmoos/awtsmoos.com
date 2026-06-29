/* B"H
Benchmark recommendation: a matrix becomes one practical next move, not raw thunder.
The Awtsmoos lets numbers bow into guidance for the human editor.
*/
import { gradeBenchmark } from './benchmarkGrade.js';

export function benchmarkValueScore(result) {
  if (!result?.supported) return 0;
  const grade = (result.grade || gradeBenchmark(result)).score || 0;
  const realtime = Math.min(8, Number(result.realtimeFactor || 0));
  const pixels = (result.width || 1) * (result.height || 1) / (640 * 360);
  return grade + realtime * 8 + Math.min(18, pixels * 4) - Math.max(0, (result.mbps || 0) - 8);
}
export function buildBenchmarkRecommendation(results = []) {
  const ranked = results.filter(r => r.supported).map(enrich).sort((a, b) => b.valueScore - a.valueScore);
  if (!ranked.length) return { summary:'No supported browser encoder scenario completed.', best:null, warnings:['WebCodecs video encoding unavailable in this environment.'], ranked:[] };
  const best = ranked[0], warnings = ranked.filter(r => r.realtimeFactor < 1).map(r => `${r.label} is below realtime.`);
  return { summary:`Use ${best.label}: ${best.encodeFps.toFixed(1)} fps, ${best.realtimeFactor.toFixed(2)}× realtime, ${best.grade.grade}, score ${best.valueScore.toFixed(1)}.`, best, warnings, ranked };
}
function enrich(result) { const grade = result.grade || gradeBenchmark(result); return { ...result, grade, valueScore:benchmarkValueScore({ ...result, grade }) }; }
