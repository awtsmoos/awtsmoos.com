// B"H
/**
 * @file awtsmoos-os.js
 * @brief Editor filesystem provider for the logged-in user's hosted Awtsmoos OS.
 */

import { InlineLogin } from '../session/inline-login.js';
import { HostedAwtsmoosFsAdapter } from '../../../../shared/virtual-os/fs/adapters/HostedAwtsmoosFsAdapter.js';

const JSON_SUFFIX = '.awtsmoosJSON';

function stripJsonSuffix(value = '') {
    const text = String(value || '');
    return text.endsWith(JSON_SUFFIX) ? text.slice(0, -JSON_SUFFIX.length) : text;
}

function normalizePath(path = '/') {
    const clean = String(path || '/').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
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

function makeAdapter({ fetchImpl, ensureSession, vesselName = 'awtsmoos-os' } = {}) {
    return new HostedAwtsmoosFsAdapter({
        fetchImpl: fetchImpl || fetch,
        vesselName,
        ensureSession: ensureSession || (() => InlineLogin.ensure())
    });
}

function throwIfBad(data, action) {
    if (!data || data.ok === false) throw new Error(data?.error || data?.message || `${action || 'Awtsmoos OS'} API error`);
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
    const kind = entry.isDirectory || entry.type === 'directory' || entry.kind === 'directory' || String(rawName).endsWith(JSON_SUFFIX)
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

export function createAwtsmoosOSProvider(options = {}) {
    const fetchImpl = options.fetchImpl || fetch;
    const ensureSession = options.ensureSession || (() => InlineLogin.ensure());
    const vesselName = options.vesselName || 'awtsmoos-os';

    async function api(action, payload = {}) {
        const got = await makeAdapter({ fetchImpl, ensureSession, vesselName }).run({
            action,
            ...payload,
            path: normalizePath(payload.path || payload.p || '.')
        });
        return throwIfBad(got, action);
    }

    async function loadAliases() {
        const session = await ensureSession();
        if (session?.ok === false) throw new Error('Awtsmoos login required.');
        const res = await fetchImpl('/api/social/aliases/details', { method: 'GET', credentials: 'include' });
        const aliases = await res.json();
        if (!res.ok || !Array.isArray(aliases)) throw new Error('Could not load Awtsmoos aliases.');
        return aliases;
    }

    return {
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
                    const aliases = await loadAliases();
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
            const res = await fetchImpl(`/api/social/aliases/${encodeURIComponent(alias)}/fileSystem/moveEntry`, {
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
}

export const AwtsmoosOSProvider = createAwtsmoosOSProvider();
export { childFromEntry, join, normalizePath, stripJsonSuffix };
