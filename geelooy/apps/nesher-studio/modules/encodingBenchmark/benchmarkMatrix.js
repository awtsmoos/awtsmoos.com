/* B"H
Benchmark matrix: each scenario runs, then the strongest vessel is revealed.
*/
import { DEFAULT_BENCHMARK_SCENARIOS } from './benchmarkScenarios.js';
import { gradeBenchmark } from './benchmarkGrade.js';
import { benchmarkValueScore, buildBenchmarkRecommendation } from './benchmarkRecommendation.js';
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
  const detail = buildBenchmarkRecommendation(results);
  return { best:detail.best, results, supportedCount:results.filter(r => r.supported).length, total:results.length, recommendation:detail.summary, recommendationDetail:detail };
}
export function valueScore(result) { return benchmarkValueScore(result); }
