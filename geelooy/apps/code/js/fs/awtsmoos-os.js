// B"H
/**
 * @file awtsmoos-os.js
 * @brief Editor filesystem provider for the logged-in user's hosted Awtsmoos OS.
 */

import { InlineLogin } from '../session/inline-login.js';

function normalizePath(path = '/') {
    const clean = String(path || '/').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
    return clean || '.';
}

function join(parent, name) {
    const base = normalizePath(parent);
    if (base === '.') return name;
    return `${base}/${name}`;
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
    const id = alias.aliasId || alias.id || alias.name;
    return {
        name: id,
        displayName: alias.displayName || alias.name || id,
        aliasId: id,
        path: id,
        type: 'directory',
        isDirectory: true
    };
}

function childFromEntry(parent, entry) {
    const name = entry.name || entry.aliasId || String(entry.path || '').split('/').pop();
    const kind = entry.isDirectory || entry.type === 'directory' ? 'directory' : 'file';
    const path = entry.path || join(parent.path, name);

    return {
        ...parent,
        ...entry,
        name,
        kind,
        path,
        type: 'awtsmoos-os',
        originalType: 'awtsmoos-os',
        workspaceId: parent.workspaceId || parent.id,
        aliasId: entry.aliasId || String(path).split('/')[0]
    };
}

export const AwtsmoosOSProvider = {
    async list(item) {
        const path = normalizePath(item.path || '.');

        if (path === '.') {
            try {
                const data = await api('list', { path: '.' });
                const items = data.detailedItems || [];
                return items.map(entry => childFromEntry(item, {
                    ...entry,
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
        const data = await api('read', { path: item.path || '.', maxChars: Number.MAX_SAFE_INTEGER });
        return data.content || '';
    },

    async write(item, content) {
        return await api('write', { path: item.path || '.', content: String(content ?? '') });
    },

    async create(parentDir, name, kind) {
        const path = join(parentDir.path || '.', name);
        if (kind === 'directory') return await api('makeFolder', { path });
        return await api('write', { path, content: '' });
    },

    async delete(item) {
        return await api('delete', { path: item.path || '.' });
    },

    async move(item, newPath) {
        const oldParsed = String(item.path || '').split('/');
        const newParsed = String(newPath || '').split('/');
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

    api
};
