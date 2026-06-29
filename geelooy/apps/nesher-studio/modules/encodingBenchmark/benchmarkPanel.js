/* B"H
Benchmark panel: one click now reveals a matrix and a best-value recommendation.
*/
import { formatBenchmarkMatrix, formatSingleBenchmark } from './benchmarkReport.js';
import { quickScenarioFromState } from './benchmarkScenarios.js';
import { runEncodingBenchmarkMatrix } from './benchmarkMatrix.js';
import { runBouncingBallEncodingBenchmark } from './webCodecsBallBenchmark.js';

export function bindEncodingBenchmarkPanel({ dom, state, setStatus }) {
  dom.runEncodingBenchmark.onclick = async () => {
    setOutput(dom, 'Running current-canvas benchmark, then comparison matrix...');
    setStatus('Running WebCodecs encoding benchmark matrix.');
    try { await runAndReport(dom, state, setStatus); }
    catch (e) { setOutput(dom, `Benchmark failed: ${e.message}`); setStatus(`Benchmark failed: ${e.message}`); }
  };
}
async function runAndReport(dom, state, setStatus) {
  const current = await runBouncingBallEncodingBenchmark(quickScenarioFromState(state));
  setOutput(dom, `Current canvas
${formatSingleBenchmark(current)}

Running matrix...`);
  const matrix = await runEncodingBenchmarkMatrix(undefined, result => setOutput(dom, `Current canvas
${formatSingleBenchmark(current)}

${result.label} done...`));
  setOutput(dom, `Current canvas
${formatSingleBenchmark(current)}

${formatBenchmarkMatrix(matrix)}`);
  setStatus(matrix.recommendation);
}
function setOutput(dom, text) { dom.encodingBenchmarkOutput.textContent = text; }
