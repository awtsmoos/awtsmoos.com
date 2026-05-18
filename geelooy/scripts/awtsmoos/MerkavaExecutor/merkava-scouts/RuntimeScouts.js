// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.RuntimeScouts = factory().RuntimeScouts; }
})(typeof self !== 'undefined' ? self : this, function() {
    const RuntimeScouts = {
        inspect(snapshot = {}) {
            const findings = [];
            if (snapshot.error) findings.push({ scout: 'RuntimeScout', severity: 'error', message: snapshot.error });
            const nodes = snapshot.graph?.nodes || [];
            if (!nodes.length) findings.push({ scout: 'ImportScout', severity: 'warn', message: 'No module graph nodes were produced.' });
            const requests = snapshot.runtime?.window?.network?.requests || [];
            for (const req of requests) if (!req.ok) findings.push({ scout: 'NetworkScout', severity: 'warn', message: 'Network miss: ' + req.url });
            const doc = snapshot.runtime?.window?.document;
            if (snapshot.runtime?.kind === 'browser' && !doc) findings.push({ scout: 'DOMScout', severity: 'error', message: 'No synthetic DOM snapshot.' });
            return findings;
        }
    };
    return { RuntimeScouts };
});
