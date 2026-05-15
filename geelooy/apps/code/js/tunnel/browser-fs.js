// B"H
/**
 * @file browser-fs.js
 * @brief Limited filesystem bridge for the code-editor as a browser tunnel.
 */

import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';

function norm(path = '.') {
    const value = String(path || '.')
        .replace(/\\+/g, '/')
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');
    return value === '.' ? '' : value;
}

function casefold(value) {
    return String(value || '').normalize('NFKC').toLowerCase();
}

function workspaceLabel(ws) {
    return ws.name || `workspace-${ws.id}`;
}

function workspaceSegment(ws) {
    return encodeURIComponent(workspaceLabel(ws));
}

function toText(raw) {
    if (raw instanceof Blob) return raw.text();
    if (raw && raw.base64Content) return Promise.resolve(atob(raw.base64Content));
    return Promise.resolve(String(raw ?? ''));
}

function rootDetailedItems() {
    return State.workspaces.map(ws => ({
        name: workspaceLabel(ws),
        type: 'directory',
        path: workspaceSegment(ws),
        absolutePath: ws.path || '/',
        isDirectory: true,
        workspaceId: ws.id,
        workspaceType: ws.originalType || ws.type
    }));
}

function findWorkspace(segment) {
    const decoded = decodeURIComponent(String(segment || ''));
    const folded = casefold(decoded);

    return State.workspaces.find(ws =>
        String(ws.id) === decoded ||
        `ws-${ws.id}` === decoded ||
        casefold(workspaceLabel(ws)) === folded
    );
}

function resolve(path = '.', kind = 'directory') {
    const clean = norm(path);
    if (!clean) return { isRoot: true, path: '.' };

    const parts = clean.split('/').filter(Boolean);
    const ws = findWorkspace(parts.shift());
    if (!ws) throw new Error(`Workspace not found for path: ${path}`);

    const rel = parts.length ? `/${parts.join('/')}` : '/';
    const name = rel === '/' ? workspaceLabel(ws) : rel.split('/').pop();

    return {
        workspace: ws,
        item: {
            ...ws,
            name,
            path: rel,
            kind,
            workspaceId: ws.id,
            type: ws.originalType || ws.type,
            originalType: ws.originalType || ws.type
        }
    };
}

function publicChild(child, ws) {
    return {
        name: child.name,
        type: child.kind === 'directory' ? 'directory' : 'file',
        path: `${workspaceSegment(ws)}${child.path === '/' ? '' : child.path}`,
        absolutePath: child.path,
        isDirectory: child.kind === 'directory',
        workspaceId: ws.id,
        workspaceType: ws.originalType || ws.type
    };
}

function byteSize(text) {
    return new Blob([String(text || '')]).size;
}

export const BrowserTunnelFS = {
    resolve,

    async list(payload = {}) {
        const p = payload.path || payload.p || '.';
        const r = resolve(p, 'directory');
        if (r.isRoot) {
            const detailedItems = rootDetailedItems();
            return {
                ok: true,
                action: 'list',
                root: 'Browser Editor Workspaces',
                path: '.',
                items: detailedItems.map(i => i.name + '/'),
                detailedItems
            };
        }

        const res = await FileSystemProvider.list(r.item);
        const entries = Array.isArray(res) ? res : (res.entries || []);
        const detailedItems = entries.map(e => publicChild(e, r.workspace));

        return {
            ok: true,
            action: 'list',
            root: workspaceLabel(r.workspace),
            path: p,
            items: detailedItems.map(i => i.isDirectory ? i.name + '/' : i.name),
            detailedItems
        };
    },

    async read(payload = {}) {
        const r = resolve(payload.path || payload.p || '.', 'file');
        if (r.isRoot) throw new Error('Cannot read browser-tunnel root.');

        const text = await toText(await FileSystemProvider.read({ ...r.item, kind: 'file' }));
        const maxChars = Number(payload.maxChars || 12000);
        const offsetChars = Number(payload.offsetChars || 0);
        const content = text.slice(offsetChars, offsetChars + maxChars);
        const nextOffsetChars = offsetChars + content.length < text.length ? offsetChars + content.length : null;

        return {
            ok: true,
            action: 'read',
            path: payload.path,
            absolutePath: r.item.path,
            mode: 'text',
            content,
            totalChars: text.length,
            offsetChars,
            nextOffsetChars,
            truncated: nextOffsetChars !== null
        };
    },

    async md(payload = {}) {
        const result = await this.read(payload);
        const lang = String(payload.path || '').split('.').pop() || '';
        return { ...result, action: 'md', content: '```' + lang + '\n' + result.content + '\n```' };
    },

    async write(payload = {}) {
        const r = resolve(payload.path || payload.p || '.', 'file');
        if (r.isRoot) throw new Error('Cannot write browser-tunnel root.');

        const content = payload.content || '';
        await FileSystemProvider.write({ ...r.item, kind: 'file' }, content);

        return {
            ok: true,
            action: 'write',
            path: payload.path,
            absolutePath: r.item.path,
            bytes: byteSize(content)
        };
    },

    async bulk(payload = {}) {
        const paths = Array.isArray(payload.paths) ? payload.paths : [];
        const files = {};
        const maxFiles = Number(payload.maxFiles || 5);

        for (const one of paths.slice(0, maxFiles)) {
            const path = typeof one === 'string' ? one : one.path;
            try {
                files[path] = await this.read({ ...payload, path, maxChars: one.maxChars || payload.maxChars });
            } catch (e) {
                files[path] = { ok: false, path, error: e.message };
            }
        }

        return {
            ok: true,
            action: 'bulk',
            requestedCount: paths.length,
            returnedCount: Object.keys(files).length,
            files
        };
    },

    async bulkWrite(payload = {}) {
        const writes = payload.writes || (payload.files
            ? Object.entries(payload.files).map(([path, content]) => ({ path, content }))
            : []);
        const results = {};

        for (const write of writes) {
            try {
                results[write.path] = await this.write({ ...payload, path: write.path, content: write.content || '' });
            } catch (e) {
                results[write.path] = { ok: false, error: e.message };
            }
        }

        return { ok: true, action: 'bulkWrite', count: writes.length, results };
    },

    async tree(payload = {}) {
        const depth = Number(payload.depth || 2);
        const limit = Number(payload.limit || 150);
        let count = 0;

        const walk = async (path, prefix, level) => {
            if (count++ >= limit) return prefix + '...limit reached\n';
            if (level > depth) return '';

            const res = await this.list({ path });
            let out = '';
            for (const item of res.detailedItems) {
                out += `${prefix}${item.name}${item.isDirectory ? '/' : ''}\n`;
                if (item.isDirectory) out += await walk(item.path, prefix + '  ', level + 1);
            }
            return out;
        };

        return {
            ok: true,
            action: 'tree',
            path: payload.path || '.',
            treeText: await walk(payload.path || '.', '', 0)
        };
    },

    async findReplace(payload = {}) {
        const current = await this.read({ ...payload, maxChars: Number.MAX_SAFE_INTEGER });
        const find = String(payload.find || '');
        if (!find) throw new Error('find is required.');

        const replace = String(payload.replace || '');
        const before = current.content;
        const after = payload.replaceAll === false
            ? before.replace(find, replace)
            : before.split(find).join(replace);

        if (before !== after) await this.write({ ...payload, content: after });

        return {
            ok: true,
            action: 'findReplace',
            path: payload.path,
            changed: before !== after,
            beforeChars: before.length,
            afterChars: after.length,
            deltaChars: after.length - before.length
        };
    }
};