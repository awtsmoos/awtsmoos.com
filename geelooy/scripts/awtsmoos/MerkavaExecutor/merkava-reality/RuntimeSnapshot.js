// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.RuntimeSnapshot = factory().RuntimeSnapshot; }
})(typeof self !== 'undefined' ? self : this, function() {
    const RuntimeSnapshot = {
        capture(runResult = {}) {
            return {
                capturedAt: new Date().toISOString(),
                ok: !!runResult.ok,
                graph: runResult.graph || runResult.assembly?.graph || null,
                runtime: runResult.result?.snapshot || null,
                error: runResult.result?.error || null,
                stack: runResult.result?.stack || null
            };
        }
    };
    return { RuntimeSnapshot };
});
