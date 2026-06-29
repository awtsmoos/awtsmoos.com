/* B"H
Benchmark matrix: each scenario runs, then the strongest vessel is revealed.
*/
import { gradeBenchmark } from './benchmarkGrade.js';
import { DEFAULT_BENCHMARK_SCENARIOS } from './benchmarkScenarios.js';
import { runBouncingBallEncodingBenchmark } from './webCodecsBallBenchmark.js';

export async function runEncodingBenchmarkMatrix(scenarios = DEFAULT_BENCHMARK_SCENARIOS, onResult = null) {
  const results = [];
  for (const scenario of scenarios) {
    const result = await runBouncingBallEncodingBenchmark(scenario);
    result.id = scenario.id; result.label = scenario.label; result.grade = gradeBenchmark(result);
    results.push(result); onResult?.(result, results.slice());
  }
  return summarizeMatrix(results);
}
export function summarizeMatrix(results) {
  const supported = results.filter(r => r.supported).sort((a, b) => valueScore(b) - valueScore(a));
  const best = supported[0] || null;
  return { best, results, supportedCount:supported.length, total:results.length, recommendation:recommend(best) };
}
export function valueScore(result) {
  if (!result?.supported) return 0;
  const rt = Math.min(8, result.realtimeFactor || 0), grade = result.grade?.score || 0;
  const pixels = (result.width || 1) * (result.height || 1) / (640 * 360);
  return grade + rt * 8 + Math.min(18, pixels * 4) - Math.max(0, (result.mbps || 0) - 8);
}
function recommend(best) {
  if (!best) return 'No supported browser encoder scenario completed.';
  return `Use ${best.label}: ${best.encodeFps.toFixed(1)} fps, ${best.realtimeFactor.toFixed(2)}× realtime, ${best.grade.grade}.`;
}
