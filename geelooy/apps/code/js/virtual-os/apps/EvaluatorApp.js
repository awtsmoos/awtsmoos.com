// B"H
/**
 * @file EvaluatorApp.js
 * @description Persistent planner/evaluator dashboard with suite scoring and gates.
 */

import { State } from '../../state.js';
import { BenchmarkHarness } from '../services/BenchmarkHarness.js';

function collectEvaluationRows() {
    const rows = [];
    for (const tab of State.tabs) {
        const ledger = tab?.vibeSession?.evaluationLedger || [];
        rows.push(...ledger);
    }
    return rows;
}

export function renderEvaluatorApp(windowState, container, desktopState, env) {
    const payload = windowState.payload || (windowState.payload = { state: BenchmarkHarness.restore() });
    const latest = collectEvaluationRows();
    if (latest.length > 0) payload.state = BenchmarkHarness.ingestEvaluationLedger(latest);
    const suites = payload.state.suites || [];
    const runs = (payload.state.runs || []).slice(-20).reverse();

    container.innerHTML = `
        <div class="app-toolbar">
            <button class="eval-refresh">Refresh Scores</button>
            <span>Total Runs: ${payload.state.runs.length}</span>
        </div>
        <div class="eval-suites">
            ${suites.map((suite) => `<div class="eval-suite"><strong>${suite.name}</strong><div>Cases: ${suite.cases}</div><div>Average: ${suite.averageScore}</div><div>Gate: ${suite.pass ? 'PASS' : 'FAIL'}</div></div>`).join('')}
        </div>
        <table class="quota-table">
            <thead><tr><th>Timestamp</th><th>Quality</th><th>Pending</th><th>Score</th></tr></thead>
            <tbody>
                ${runs.map((run) => `<tr><td>${run.at}</td><td>${run.qualityScore}</td><td>${run.pendingSteps}</td><td>${run.score}</td></tr>`).join('')}
            </tbody>
        </table>
    `;

    container.querySelector('.eval-refresh').onclick = () => {
        payload.state = BenchmarkHarness.ingestEvaluationLedger(collectEvaluationRows());
        env.requestRender();
    };
}
