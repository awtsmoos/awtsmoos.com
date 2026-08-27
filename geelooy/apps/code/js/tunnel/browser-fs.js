// B"H
/**
 * @file browser-fs.js
 * @brief Filesystem bridge for the code editor when the browser tab itself becomes a tunnel.
 *
 * B"H.
 * The Awtsmoos speaks every workspace into being through its own provider.
 * This adapter gathers those separate worlds under one root, so the hosted
 * tunnel control API can see the open editor tab as a living relay without
 * installing a local agent. It mirrors the safe filesystem side of the local
 * agent contract; command and Chrome DevTools actions remain intentionally
 * unavailable because a normal browser page must not pretend to be a native
 * shell.
 */

import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';

export const BROWSER_TUNNEL_FS_ACTIONS = Object.freeze([
    'stat', 'list', 'tree', 'read', 'readLines', 'readManyLines', 'readBytes',
    'read64', 'md', 'bulk', 'grep', 'findFiles', 'fileHashes', 'write',
    'bulkWrite', 'writeIfHash', 'bulkWriteIfHashes', 'findReplace',
    'replaceRange', 'applyPatch', 'mkdirp', 'ensureFile', 'touch',
    'deleteFile', 'deleteTree', 'emptyDir', 'rg', 'selectString', 'selectStringFile'
]);

const encoder = new TextEncoder();

function norm(path = '.') {
    const value = String(path || '.').replace(/\\+/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
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

async function sha256(text) {
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(String(text ?? '')));
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function textToBase64(text) {
    const bytes = encoder.encode(String(text ?? ''));
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
}

async function toText(raw) {
    if (raw instanceof Blob) return await raw.text();
    if (raw && raw.base64Content) return atob(raw.base64Content);
    return String(raw ?? '');
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

function lineSlice(text, startLine = 1, endLine = 250) {
    const lines = String(text ?? '').split(/\r?\n/);
    const start = Math.max(1, Number(startLine || 1));
    const end = Math.max(start, Number(endLine || start));
    return {
        startLine: start,
        endLine: Math.min(end, lines.length),
        totalLines: lines.length,
        lines: lines.slice(start - 1, end).map((text, index) => ({ line: start + index, text }))
    };
}

async function walkFiles(rootPath, visitor, options = {}) {
    const limit = Number(options.limit || options.maxResults || 500);
    let count = 0;

    async function visit(path) {
        if (count >= limit) return;
        const listed = await BrowserTunnelFS.list({ path });
        for (const item of listed.detailedItems || []) {
            if (count >= limit) return;
            if (item.isDirectory) {
                await visit(item.path);
            } else {
                count++;
                await visitor(item);
            }
        }
    }

    await visit(rootPath || '.');
}

function regexFromPayload(payload) {
    const query = String(payload.query || payload.find || '');
    if (!query) throw new Error('query or find is required.');
    if (payload.regex) return new RegExp(query, 'g');
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return new RegExp(escapedQuery, 'g');
}

async function readWhole(payload) {
    return await BrowserTunnelFS.read({ ...payload, maxChars: Number.MAX_SAFE_INTEGER, offsetChars: 0 });
}

export const BrowserTunnelFS = {
    resolve,

    async stat(payload = {}) {
        const p = payload.path || payload.p || '.';
        const r = resolve(p, 'directory');
        if (r.isRoot) return { ok: true, action: 'stat', path: '.', type: 'directory', isDirectory: true, root: true };
        const parentPath = p.split('/').slice(0, -1).join('/') || '.';
        const name = p.split('/').pop();
        const listed = await this.list({ path: parentPath });
        const found = (listed.detailedItems || []).find(x => x.name === name || x.path === p);
        return { ok: true, action: 'stat', path: p, exists: !!found, ...(found || {}) };
    },

    async list(payload = {}) {
        const p = payload.path || payload.p || '.';
        const r = resolve(p, 'directory');
        if (r.isRoot) {
            const detailedItems = rootDetailedItems();
            return { ok: true, action: 'list', root: 'Browser Editor Workspaces', path: '.', items: detailedItems.map(i => i.name + '/'), detailedItems };
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
        return { ok: true, action: 'read', path: payload.path, absolutePath: r.item.path, mode: 'text', content, totalChars: text.length, offsetChars, nextOffsetChars, truncated: nextOffsetChars !== null };
    },

    async readBytes(payload = {}) {
        const full = await readWhole(payload);
        const bytes = encoder.encode(full.content);
        const offsetBytes = Number(payload.offsetBytes || 0);
        const maxBytes = Number(payload.maxBytes || 24000);
        const slice = bytes.slice(offsetBytes, offsetBytes + maxBytes);
        const content = new TextDecoder().decode(slice);
        const nextOffsetBytes = offsetBytes + slice.length < bytes.length ? offsetBytes + slice.length : null;
        return { ok: true, action: 'readBytes', path: payload.path, mode: 'text', content, totalBytes: bytes.length, offsetBytes, nextOffsetBytes, truncated: nextOffsetBytes !== null };
    },

    async read64(payload = {}) {
        const full = await readWhole(payload);
        const bytes = encoder.encode(full.content);
        const offsetBytes = Number(payload.offsetBytes || 0);
        const maxBytes = Number(payload.maxBytes || 24000);
        const sliceText = new TextDecoder().decode(bytes.slice(offsetBytes, offsetBytes + maxBytes));
        const returnedBytes = encoder.encode(sliceText).length;
        const nextOffsetBytes = offsetBytes + returnedBytes < bytes.length ? offsetBytes + returnedBytes : null;
        return { ok: true, action: 'read64', path: payload.path, base64: textToBase64(sliceText), totalBytes: bytes.length, offsetBytes, returnedBytes, nextOffsetBytes, truncated: nextOffsetBytes !== null };
    },

    async readLines(payload = {}) {
        const full = await readWhole(payload);
        return { ok: true, action: 'readLines', path: payload.path, ...lineSlice(full.content, payload.startLine, payload.endLine) };
    },

    async readManyLines(payload = {}) {
        const ranges = Array.isArray(payload.ranges) ? payload.ranges : [];
        const results = {};
        for (const range of ranges) {
            const path = range.path || payload.path;
            const full = await readWhole({ ...payload, path });
            results[path] = { ok: true, path, ...lineSlice(full.content, range.startLine || payload.startLine, range.endLine || payload.endLine) };
        }
        return { ok: true, action: 'readManyLines', count: ranges.length, results };
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
        return { ok: true, action: 'write', path: payload.path, absolutePath: r.item.path, bytes: byteSize(content) };
    },

    async bulk(payload = {}) {
        const paths = Array.isArray(payload.paths) ? payload.paths : [];
        const files = {};
        for (const one of paths.slice(0, Number(payload.maxFiles || 5))) {
            const path = typeof one === 'string' ? one : one.path;
            try { files[path] = await this.read({ ...payload, path, maxChars: one.maxChars || payload.maxChars }); }
            catch (e) { files[path] = { ok: false, path, error: e.message }; }
        }
        return { ok: true, action: 'bulk', requestedCount: paths.length, returnedCount: Object.keys(files).length, files };
    },

    async bulkWrite(payload = {}) {
        const writes = payload.writes || (payload.files ? Object.entries(payload.files).map(([path, content]) => ({ path, content })) : []);
        const results = {};
        for (const write of writes) {
            try { results[write.path] = await this.write({ ...payload, path: write.path, content: write.content || '' }); }
            catch (e) { results[write.path] = { ok: false, error: e.message }; }
        }
        return { ok: true, action: 'bulkWrite', count: writes.length, results };
    },

    async writeIfHash(payload = {}) {
        const current = await readWhole(payload);
        const got = await sha256(current.content);
        if (payload.expectedSha256 && payload.expectedSha256 !== got) {
            return { ok: false, action: 'writeIfHash', path: payload.path, error: 'sha256_mismatch', sha256: got, expectedSha256: payload.expectedSha256 };
        }
        const wrote = await this.write(payload);
        return { ...wrote, action: 'writeIfHash', previousSha256: got, sha256: await sha256(payload.content || '') };
    },

    async bulkWriteIfHashes(payload = {}) {
        const writes = payload.writes || [];
        const results = {};
        for (const write of writes) results[write.path] = await this.writeIfHash({ ...payload, ...write });
        return { ok: true, action: 'bulkWriteIfHashes', count: writes.length, results };
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
        return { ok: true, action: 'tree', path: payload.path || '.', treeText: await walk(payload.path || '.', '', 0) };
    },

    async rg(payload = {}) {
        return await this.grep(payload);
    },

    async selectString(payload = {}) {
        return await this.grep(payload);
    },

    async selectStringFile(payload = {}) {
        return await this.grep(payload);
    },

async grep(payload = {}) {
        const matcher = regexFromPayload(payload);
        const results = [];
        await walkFiles(payload.path || '.', async item => {
            const text = (await readWhole({ ...payload, path: item.path })).content;
            text.split(/\r?\n/).forEach((line, index) => {
                if (matcher.test(line)) results.push({ path: item.path, lineNumber: index + 1, line });
                matcher.lastIndex = 0;
            });
        }, payload);
        return { ok: true, action: 'grep', query: payload.query || payload.find || '', count: results.length, results };
    },

    async findFiles(payload = {}) {
        const query = casefold(payload.query || payload.find || payload.ext || '');
        const results = [];
        await walkFiles(payload.path || '.', async item => {
            if (!query || casefold(item.name).includes(query) || casefold(item.path).includes(query)) results.push(item);
        }, payload);
        return { ok: true, action: 'findFiles', query, count: results.length, results };
    },

    async fileHashes(payload = {}) {
        const paths = Array.isArray(payload.paths) ? payload.paths : [payload.path || payload.p || '.'];
        const files = {};
        for (const path of paths) {
            const data = await readWhole({ ...payload, path });
            files[path] = { ok: true, path, sha256: await sha256(data.content), bytes: byteSize(data.content) };
        }
        return { ok: true, action: 'fileHashes', files };
    },

    async findReplace(payload = {}) {
        const current = await readWhole(payload);
        const find = String(payload.find || '');
        if (!find) throw new Error('find is required.');
        const replace = String(payload.replace || '');
        const before = current.content;
        const after = payload.regex
            ? before.replace(new RegExp(find, payload.replaceAll === false ? '' : 'g'), replace)
            : (payload.replaceAll === false ? before.replace(find, replace) : before.split(find).join(replace));
        if (before !== after) await this.write({ ...payload, content: after });
        return { ok: true, action: 'findReplace', path: payload.path, changed: before !== after, beforeChars: before.length, afterChars: after.length, deltaChars: after.length - before.length };
    },

    async replaceRange(payload = {}) {
        const current = await readWhole(payload);
        const start = Number(payload.start || payload.startOffset || 0);
        const end = Number(payload.end || payload.endOffset || start);
        const next = current.content.slice(0, start) + String(payload.content || '') + current.content.slice(end);
        await this.write({ ...payload, content: next });
        return { ok: true, action: 'replaceRange', path: payload.path, beforeChars: current.content.length, afterChars: next.length };
    },

    async applyPatch(payload = {}) {
        if (payload.find) return await this.findReplace(payload);
        throw new Error('Browser applyPatch currently requires find/replace fields.');
    },

    async mkdirp(payload = {}) {
        return await this._createAtPath(payload.path || payload.p || '.', 'directory');
    },

    async ensureFile(payload = {}) {
        return await this._createAtPath(payload.path || payload.p || '.', 'file');
    },

    async touch(payload = {}) {
        const path = payload.path || payload.p || '.';
        try { await readWhole({ ...payload, path }); }
        catch (_) { return await this.ensureFile({ ...payload, path }); }
        return { ok: true, action: 'touch', path, existed: true };
    },

    async _createAtPath(path, kind) {
        const clean = norm(path);
        const parts = clean.split('/').filter(Boolean);
        const name = parts.pop();
        const parentPath = parts.join('/') || '.';
        const r = resolve(parentPath, 'directory');
        if (r.isRoot) throw new Error('Choose a workspace before creating paths.');
        await FileSystemProvider.create({ ...r.item, kind: 'directory' }, name, kind);
        return { ok: true, action: kind === 'directory' ? 'mkdirp' : 'ensureFile', path };
    },

    async deleteFile(payload = {}) {
        return await this.delete(payload);
    },

    async deleteTree(payload = {}) {
        return await this.delete(payload);
    },

    async emptyDir(payload = {}) {
        const listed = await this.list(payload);
        for (const item of listed.detailedItems || []) await this.delete({ path: item.path });
        return { ok: true, action: 'emptyDir', path: payload.path || payload.p || '.', count: (listed.detailedItems || []).length };
    },

    async delete(payload = {}) {
        const r = resolve(payload.path || payload.p || '.', 'file');
        if (r.isRoot) throw new Error('Cannot delete browser-tunnel root.');
        await FileSystemProvider.delete(r.item);
        return { ok: true, action: payload.action || 'delete', path: payload.path || payload.p, absolutePath: r.item.path };
    }
};








