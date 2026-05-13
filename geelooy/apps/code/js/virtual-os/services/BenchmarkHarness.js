// B"H
/**
 * @file BenchmarkHarness.js
 * @description Persistent benchmark/eval scoring from vibe sessions and loop ledgers.
 */

const KEY = 'awtsmoos_benchmark_harness_v1';

function scoreRun(run) {
    const quality = Number(run.qualityScore || 0);
    const pending = Number(run.pendingSteps || 0);
    const speedBonus = run.durationMs && run.durationMs < 7000 ? 10 : 0;
    return Math.max(0, quality - pending * 10 + speedBonus);
}

export const BenchmarkHarness = {
    restore() {
        try {
            const raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : { runs: [], suites: [] };
        } catch (error) {
            return { runs: [], suites: [] };
        }
    },

    save(state) {
        localStorage.setItem(KEY, JSON.stringify(state));
    },

    ingestEvaluationLedger(evaluationLedger = []) {
        const state = this.restore();
        for (const row of evaluationLedger) {
            const runId = `${row.at}_${row.qualityScore}`;
            if (state.runs.some((run) => run.id === runId)) continue;
            state.runs.push({
                id: runId,
                at: row.at,
                qualityScore: row.qualityScore,
                pendingSteps: row.pendingSteps,
                durationMs: null,
                score: scoreRun(row)
            });
        }
        state.runs = state.runs.slice(-500);
        this._refreshSuites(state);
        this.save(state);
        return state;
    },

    _refreshSuites(state) {
        const latest = state.runs.slice(-50);
        const avg = latest.length
            ? Math.round(latest.reduce((sum, run) => sum + run.score, 0) / latest.length)
            : 0;
        state.suites = [
            {
                id: 'regression-core',
                name: 'Core Regression Gate',
                cases: latest.length,
                averageScore: avg,
                pass: avg >= 70
            }
        ];
    }
};
