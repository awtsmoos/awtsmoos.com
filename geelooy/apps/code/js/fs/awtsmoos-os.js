// B"H
/**
 * @file awtsmoos-os.js
 * @brief Editor filesystem provider for the logged-in user's hosted Awtsmoos OS.
 */

import { InlineLogin } from '../session/inline-login.js';

const JSON_SUFFIX = '.awtsmoosJSON';

function stripJsonSuffix(value = '') {
    const text = String(value || '');
    return text.endsWith(JSON_SUFFIX) ? text.slice(0, -JSON_SUFFIX.length) : text;
}

function normalizePath(path = '/') {
    const clean = String(path || '/').replace(/\\\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
    if (!clean || clean === '.') return '.';
    return clean.split('/').filter(Boolean).map(stripJsonSuffix).join('/');
}

function join(parent, name) {
    const base = normalizePath(parent);
    if (base === '.') return stripJsonSuffix(name);
    return `${base}/${stripJsonSuffix(name)}`;
}

function normalizeEntryPath(path = '') {
    const clean = normalizePath(path);
    return clean === '.' ? '.' : clean;
}

async function api(action, payload = {}) {
    const session = await InlineLogin.ensure();
    if (!session.ok) throw new Error('Awtsmoos login required.');

    const query = new URLSearchParams();
    const packed = {
        action,
        ...payload,
        path: normalizePath(payload.path || payload.p || '.')
    };

    for (const [key, value] of Object.entries(packed)) {
        if (value === undefined || value === null) continue;
        if (typeof value === 'object') query.set(key, JSON.stringify(value));
        else query.set(key, String(value));
    }

    const res = await fetch('/api/tunnel/control/fs/awtsmoos-os?' + query.toString(), {
        method: 'GET',
        credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok || data.ok === false) {
        throw new Error(data.error || data.message || `Awtsmoos OS API error: ${res.status}`);
    }
    return data;
}

function aliasEntry(alias = {}) {
    const rawId = alias.aliasId || alias.id || alias.name;
    const id = stripJsonSuffix(rawId);
    return {
        name: id,
        displayName: stripJsonSuffix(alias.displayName || alias.name || id),
        aliasId: id,
        path: id,
        type: 'directory',
        isDirectory: true
    };
}

function childFromEntry(parent, entry) {
    const rawName = entry.name || entry.aliasId || String(entry.path || '').split('/').pop();
    const name = stripJsonSuffix(rawName);
    const kind = entry.isDirectory || entry.type === 'directory' || String(rawName).endsWith(JSON_SUFFIX)
        ? 'directory'
        : 'file';
    const path = normalizeEntryPath(entry.path || join(parent.path, name));
    const aliasId = stripJsonSuffix(entry.aliasId || String(path).split('/')[0]);

    return {
        ...parent,
        ...entry,
        name,
        displayName: stripJsonSuffix(entry.displayName || name),
        kind,
        path,
        type: 'awtsmoos-os',
        originalType: 'awtsmoos-os',
        workspaceId: parent.workspaceId || parent.id,
        aliasId
    };
}

function pathOf(item) {
    return normalizePath(item.path || '.');
}

export const AwtsmoosOSProvider = {
    async list(item) {
        const path = pathOf(item);

        if (path === '.') {
            try {
                const data = await api('list', { path: '.' });
                return (data.detailedItems || []).map(entry => childFromEntry(item, {
                    ...entry,
                    name: stripJsonSuffix(entry.name || entry.aliasId || entry.id),
                    path: stripJsonSuffix(entry.path || entry.name || entry.aliasId || entry.id),
                    type: 'directory',
                    isDirectory: true
                }));
            } catch (_) {
                const res = await fetch('/api/social/aliases/details', { method: 'GET', credentials: 'include' });
                const aliases = await res.json();
                if (!res.ok || !Array.isArray(aliases)) throw new Error('Could not load Awtsmoos aliases.');
                return aliases.map(a => childFromEntry(item, aliasEntry(a))).filter(x => x.name);
            }
        }

        const data = await api('list', { path });
        return (data.detailedItems || []).map(entry => childFromEntry(item, entry));
    },

    async read(item) {
        const data = await api('read', { path: pathOf(item), maxChars: Number.MAX_SAFE_INTEGER });
        return data.content || '';
    },

    async write(item, content) {
        return await api('write', { path: pathOf(item), content: String(content ?? '') });
    },

    async create(parentDir, name, kind) {
        const path = join(parentDir.path || '.', name);
        if (kind === 'directory') return await api('makeFolder', { path });
        return await api('write', { path, content: '' });
    },

    async delete(item) {
        return await api('delete', { path: pathOf(item) });
    },

    async move(item, newPath) {
        const oldParsed = normalizePath(item.path || '').split('/');
        const newParsed = normalizePath(newPath || '').split('/');
        if (oldParsed[0] !== newParsed[0]) throw new Error('Moving between aliases is not supported yet.');

        const alias = oldParsed.shift();
        newParsed.shift();
        const res = await fetch(`/api/social/aliases/${encodeURIComponent(alias)}/fileSystem/moveEntry`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ oldPath: oldParsed.join('/'), newPath: newParsed.join('/') })
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error?.message || data.error || 'Move failed');
        return data;
    },

    async fileHashes(item, payload = {}) {
        return await api('fileHashes', { ...payload, path: pathOf(item) });
    },

    async writeIfHash(item, content, expectedSha256) {
        return await api('writeIfHash', { path: pathOf(item), content: String(content ?? ''), expectedSha256 });
    },

    async astOutline(item) {
        return await api('astOutline', { path: pathOf(item) });
    },

    async semanticSearch(item, query, options = {}) {
        return await api('semanticSearch', { ...options, path: pathOf(item), query });
    },

    async dependencyGraph(item, options = {}) {
        return await api('dependencyGraph', { ...options, path: pathOf(item) });
    },

    async connectedFiles(item, options = {}) {
        return await api('connectedFiles', { ...options, path: pathOf(item) });
    },

    async replaceRange(item, payload) {
        return await api('replaceRange', { ...payload, path: pathOf(item) });
    },

    async applyPatch(item, payload) {
        return await api('applyPatch', { ...payload, path: pathOf(item) });
    },

    api
};
