// B"H
/**
 * @file EvaluatorGate.js
 * @description Codex-style self-check gate for autonomous loop continuation.
 */

const FAILURE_WORDS = ['failed', 'error', 'timeout', 'not implemented', 'todo'];

function scoreText(text = '') {
    const lowered = String(text || '').toLowerCase();
    let penalties = 0;
    for (const token of FAILURE_WORDS) {
        if (lowered.includes(token)) penalties += 1;
    }
    return Math.max(0, 100 - penalties * 20);
}

export const EvaluatorGate = {
    /**
     * @param {object} args
     * @param {string} args.visibleText
     * @param {Array<object>} args.toolCalls
     * @param {object} args.tab
     * @returns {{shouldContinue: boolean, report: object}}
     */
    evaluate({ visibleText, toolCalls, tab }) {
        const plan = this._buildPlan(visibleText, toolCalls);
        const qualityScore = scoreText(visibleText);
        const hasToolWork = Array.isArray(toolCalls) && toolCalls.length > 0;
        const report = {
            at: new Date().toISOString(),
            qualityScore,
            pendingSteps: plan.filter((step) => step.status !== 'done').length,
            steps: plan
        };

        if (!tab.vibeSession.evaluationLedger) tab.vibeSession.evaluationLedger = [];
        tab.vibeSession.evaluationLedger.unshift(report);
        tab.vibeSession.evaluationLedger = tab.vibeSession.evaluationLedger.slice(0, 50);

        const likelyIncomplete = qualityScore < 70 || report.pendingSteps > 0;
        return {
            shouldContinue: likelyIncomplete && hasToolWork,
            report
        };
    },

    _buildPlan(text, toolCalls) {
        const hasTests = Array.isArray(toolCalls) && toolCalls.some((call) => String(call.function?.name || '').includes('test'));
        const hasWrite = Array.isArray(toolCalls) && toolCalls.some((call) => String(call.function?.name || '').includes('engrave'));
        const saysDone = /\b(done|completed|finished)\b/i.test(String(text || ''));
        return [
            { step: 'Implemented requested changes', status: hasWrite ? 'done' : 'pending' },
            { step: 'Executed validation/tests', status: hasTests ? 'done' : 'pending' },
            { step: 'Declared completion', status: saysDone ? 'done' : 'pending' }
        ];
    }
};
