// B"H
/**
 * B"H
 * Browser-tunnel analysis actions.
 * These are the safe page-native replacements for shell commands like
 * Select-String, syntax outlines, and import-connected reading.
 */

function casefold(value) {
    return String(value || '').toLowerCase();
}

function lines(text) {
    return String(text ?? '').split(/\r?\n/);
}

function escapeRegex(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toRegex(payload) {
    const q = String(payload.query || payload.find || payload.pattern || '');
    if (!q) throw new Error('query, find, or pattern is required.');
    return payload.regex ? new RegExp(q, payload.caseSensitive ? 'g' : 'gi') : new RegExp(escapeRegex(q), payload.caseSensitive ? 'g' : 'gi');
}

const SYMBOL_RXES = [
    /\bexport\s+(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
    /\b(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
    /\bclass\s+([A-Za-z_$][\w$]*)/g,
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/g
];

function outlineText(text) {
    const out = [];
    for (const re of SYMBOL_RXES) {
        let m;
        while ((m = re.exec(text))) out.push({ name: m[1], index: m.index });
    }
    return out.sort((a, b) => a.index - b.index).slice(0, 200);
}

function comments(text) {
    return (String(text ?? '').match(/\/\*\*[\s\S]*?\*\/|\/\/[^\n]*/g) || []).slice(0, 50);
}

export function attachBrowserAnalysis(FS) {
    FS.selectString = async function selectString(payload = {}) {
        const matcher = toRegex(payload);
        const results = [];
        await FS._eachFile(payload.path || payload.p || '.', payload, async item => {
            const text = (await FS.read({ ...payload, path: item.path, maxChars: Number.MAX_SAFE_INTEGER })).content;
            lines(text).forEach((line, index) => {
                if (results.length < Number(payload.maxResults || 200) && matcher.test(line)) results.push({ path: item.path, lineNumber: index + 1, line });
                matcher.lastIndex = 0;
            });
        });
        return { ok: true, action: 'selectString', query: payload.query || payload.find || payload.pattern, count: results.length, results };
    };

    FS.symbolOutline = async function symbolOutline(payload = {}) {
        const text = (await FS.read({ ...payload, maxChars: Number.MAX_SAFE_INTEGER })).content;
        return { ok: true, action: 'symbolOutline', path: payload.path || payload.p, symbols: outlineText(text), comments: payload.includeComments === false ? [] : comments(text) };
    };

    FS.connectedFiles = async function connectedFiles(payload = {}) {
        const entry = payload.path || payload.p || '.';
        const maxFiles = Number(payload.maxFiles || 80);
        const files = [];
        const seen = new Set();
        const visit = async (path, depth) => {
            if (seen.has(path) || files.length >= maxFiles || depth > Number(payload.depth || 4)) return;
            seen.add(path);
            try {
                const file = await FS.read({ ...payload, path, maxChars: Number.MAX_SAFE_INTEGER });
                const outline = payload.mode === 'outline' ? outlineText(file.content) : undefined;
                files.push({ path, depth, bytes: file.content.length, symbols: outline, content: payload.mode === 'full' ? file.content : undefined });
            } catch (_) { return; }
        };
        await visit(entry, 0);
        return { ok: true, action: 'connectedFiles', entry, note: 'Browser mode reads the starting file and outline; local tunnel has full import tracing.', count: files.length, files };
    };

    FS._eachFile = async function _eachFile(root, payload, visitor) {
        await FS.walkFiles?.(root, visitor, payload);
        if (FS.walkFiles) return;
        const listed = await FS.list({ path: root });
        for (const item of listed.detailedItems || []) {
            if (item.isDirectory) await FS._eachFile(item.path, payload, visitor);
            else await visitor(item);
        }
    };

    return FS;
}

export const BROWSER_ANALYSIS_ACTIONS = Object.freeze(['selectString', 'symbolOutline', 'connectedFiles']);
