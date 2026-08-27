// B"H
/**
 * @file RealityScore.js
 * @brief Scores whether generated software has become usable runtime reality.
 */

/**
 * Scores runtime evidence with explicit pass/fail gates.
 */
export const RealityScore = {
    /**
     * Computes a conservative stability score.
     *
     * @param {object} snapshot Runtime snapshot.
     * @param {object} [options] Scoring options.
     * @returns {object} Reality score and gates.
     */
    compute(snapshot = {}, options = {}) {
        const threshold = Number(options.threshold || 85);
        const gates = {
            runnableEntry: !!snapshot.health?.hasRunnableEntry,
            previewUrl: !!snapshot.health?.hasPreviewUrl,
            previewRunning: ['running', 'unknown'].includes(snapshot.health?.status || 'unknown'),
            noRuntimeErrors: Number(snapshot.health?.errorCount || 0) === 0,
            importAssetsOk: snapshot.importVerification ? !!snapshot.importVerification.ok : true
        };

        let score = 100;
        if (!gates.runnableEntry) score -= 35;
        if (!gates.previewUrl) score -= 30;
        if (!gates.previewRunning) score -= 20;
        if (!gates.importAssetsOk) score -= 15;
        score -= Math.min(30, Number(snapshot.health?.errorCount || 0) * 10);

        const failed = Object.entries(gates)
            .filter(([, ok]) => !ok)
            .map(([name]) => name);

        return {
            ok: score >= threshold && failed.length === 0,
            score: Math.max(0, Math.min(100, score)),
            threshold,
            gates,
            failed,
            summary: failed.length
                ? `Reality not stable: ${failed.join(', ')}`
                : 'Reality is stable enough for handoff.'
        };
    }
};
