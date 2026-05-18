// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.RealityScore = factory().RealityScore; }
})(typeof self !== 'undefined' ? self : this, function() {
    const RealityScore = {
        compute(snapshot = {}) {
            let score = 100;
            const failed = [];
            if (!snapshot.ok) { score -= 40; failed.push('runtimeExecution'); }
            if (snapshot.error) { score -= 25; failed.push('runtimeError'); }
            if (!snapshot.graph) { score -= 15; failed.push('runtimeGraph'); }
            const runtime = snapshot.runtime || {};
            const logs = runtime.window?.console?.logs || runtime.logs || [];
            if (logs.some(l => l.level === 'error')) { score -= 10; failed.push('consoleErrors'); }
            return { ok: failed.length === 0 && score >= 85, score: Math.max(0, score), failed };
        }
    };
    return { RealityScore };
});
