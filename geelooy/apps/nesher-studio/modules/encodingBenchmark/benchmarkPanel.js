/* B"H
Benchmark panel: fast smoke and full matrix both reveal honest WebCodecs value.
*/
import { verifyEncodingCapabilities } from './benchmarkCapability.js';
import { formatBenchmarkMatrix, formatSingleBenchmark } from './benchmarkReport.js';
import { quickScenarioFromState, SMOKE_BENCHMARK_SCENARIOS } from './benchmarkScenarios.js';
import { runEncodingBenchmarkMatrix } from './benchmarkMatrix.js';
import { runBouncingBallEncodingBenchmark } from './webCodecsBallBenchmark.js';

export function bindEncodingBenchmarkPanel({ dom, state, setStatus }) {
  dom.runEncodingBenchmark.onclick = async () => runFull(dom, state, setStatus);
  dom.runSmokeEncodingBenchmark.onclick = async () => runSmoke(dom, setStatus);
}
async function runFull(dom, state, setStatus) {
  setOutput(dom, 'Running current-canvas benchmark, then comparison matrix...'); setStatus('Running WebCodecs encoding benchmark matrix.');
  try { await runAndReport(dom, state, setStatus); } catch (e) { fail(dom, setStatus, e); }
}
async function runSmoke(dom, setStatus) {
  setOutput(dom, 'Probing fast smoke encoder capability...'); setStatus('Running fast benchmark smoke mode.');
  try {
    const capability = await verifyEncodingCapabilities(SMOKE_BENCHMARK_SCENARIOS);
    setOutput(dom, `Smoke capability\n${capabilityLines(capability)}\n\nEncoding tiny frames...`);
    const matrix = await runEncodingBenchmarkMatrix(SMOKE_BENCHMARK_SCENARIOS, r => setOutput(dom, `Smoke capability\n${capabilityLines(capability)}\n\n${r.label} done...`));
    setOutput(dom, `Fast smoke mode\n${capabilityLines(capability)}\n\n${formatBenchmarkMatrix(matrix)}`); setStatus(matrix.recommendation);
  } catch (e) { fail(dom, setStatus, e); }
}
async function runAndReport(dom, state, setStatus) {
  const current = await runBouncingBallEncodingBenchmark(quickScenarioFromState(state));
  setOutput(dom, `Current canvas\n${formatSingleBenchmark(current)}\n\nRunning matrix...`);
  const matrix = await runEncodingBenchmarkMatrix(undefined, result => setOutput(dom, `Current canvas\n${formatSingleBenchmark(current)}\n\n${result.label} done...`));
  setOutput(dom, `Current canvas\n${formatSingleBenchmark(current)}\n\n${formatBenchmarkMatrix(matrix)}`); setStatus(matrix.recommendation);
}
function capabilityLines(rows) { return rows.map(r => `${r.scenarioId}: ${r.supported ? 'supported' : `limited (${r.reason})`}`).join('\n'); }
function fail(dom, setStatus, e) { setOutput(dom, `Benchmark failed: ${e.message}`); setStatus(`Benchmark failed: ${e.message}`); }
function setOutput(dom, text) { dom.encodingBenchmarkOutput.textContent = text; }
