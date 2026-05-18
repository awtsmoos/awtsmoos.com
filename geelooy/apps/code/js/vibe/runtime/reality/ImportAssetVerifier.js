// B"H
/**
 * @file ImportAssetVerifier.js
 * @brief Lightweight import and asset truth-checking for sampled app entries.
 */

/**
 * B"H
 * Reads static import-like references from sampled project text without assuming
 * Node, shell, or one specific bundler. This is intentionally conservative:
 * it reports suspicious references and unresolved-looking relative links from
 * the evidence already available to the agent.
 */
export const ImportAssetVerifier = {
    /**
     * Verifies sampled entry files for obvious import, stylesheet, script, and asset risks.
     *
     * @param {object} project Static project inspection.
     * @returns {object} Import and asset verification report.
     */
    verifyProjectSamples(project = {}) {
        const samples = project.samples || {};
        const refs = [
            ...extractJsRefs(samples.indexJs || '', 'index.js'),
            ...extractJsRefs(samples.serverJs || '', 'server.js'),
            ...extractHtmlRefs(samples.indexHtml || '', 'index.html')
        ];

        const risks = refs
            .map(ref => ({ ...ref, risk: classify(ref) }))
            .filter(ref => ref.risk.level !== 'ok');

        return {
            ok: risks.filter(r => r.risk.level === 'error').length === 0,
            checkedAt: new Date().toISOString(),
            referenceCount: refs.length,
            refs,
            risks,
            summary: risks.length
                ? `Import/assets need attention: ${risks.length} suspicious reference(s).`
                : 'No obvious import or asset risks found in sampled entries.'
        };
    }
};

function extractJsRefs(text, file) {
    const refs = [];
    const patterns = [
        /\bimport\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g,
        /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
        /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g
    ];
    for (const pattern of patterns) {
        for (const match of text.matchAll(pattern)) {
            refs.push({ file, kind: 'module', value: match[1] });
        }
    }
    return refs;
}

function extractHtmlRefs(text, file) {
    const refs = [];
    const patterns = [
        /\bsrc\s*=\s*['"]([^'"]+)['"]/g,
        /\bhref\s*=\s*['"]([^'"]+)['"]/g
    ];
    for (const pattern of patterns) {
        for (const match of text.matchAll(pattern)) {
            refs.push({ file, kind: guessKind(match[1]), value: match[1] });
        }
    }
    return refs;
}

function guessKind(value) {
    if (/\.css(?:$|\?)/i.test(value)) return 'stylesheet';
    if (/\.js(?:$|\?)/i.test(value)) return 'script';
    if (/\.(png|jpg|jpeg|gif|svg|webp|ico)(?:$|\?)/i.test(value)) return 'asset';
    return 'link';
}

function classify(ref) {
    const value = String(ref.value || '');
    if (!value) return { level: 'error', reason: 'empty reference' };
    if (/^(https?:|data:|blob:|mailto:|tel:)/i.test(value)) return { level: 'ok', reason: 'external or browser URL' };
    if (value.startsWith('/scripts/')) return { level: 'ok', reason: 'public geelooy script root' };
    if (value.startsWith('/')) return { level: 'warn', reason: 'absolute public-root path; verify geelooy route serves it' };
    if (value.startsWith('.') && !/\.[a-z0-9]+(?:$|\?)/i.test(value) && ref.kind !== 'module') {
        return { level: 'warn', reason: 'relative reference has no extension' };
    }
    if (ref.kind === 'module' && value.startsWith('.') && !/\.(js|mjs|jsx|ts|tsx|json)(?:$|\?)/i.test(value)) {
        return { level: 'warn', reason: 'relative module has no explicit runtime extension' };
    }
    return { level: 'ok', reason: 'reference shape accepted' };
}
