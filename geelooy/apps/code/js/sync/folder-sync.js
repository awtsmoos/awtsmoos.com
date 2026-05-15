// B"H
/**
 * @file folder-sync.js
 * @brief Provider-agnostic folder link/sync engine.
 */

import { State } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { App } from '../app.js';
import { Workspaces } from '../workspaces/index.js';

function nowId() {
    return 'sync-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}

function cleanRel(path) {
    return String(path || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
}

function joinPath(base, rel) {
    const b = String(base || '/').replace(/\\/g, '/').replace(/\/+$/, '');
    const r = cleanRel(rel);
    if (!r) return b || '/';
    return `${b === '/' ? '' : b}/${r}` || '/';
}

function pathWithin(base, candidate) {
    const b = cleanRel(base);
    const c = cleanRel(candidate);
    if (!b || b === '.') return true;
    return c === b || c.startsWith(b + '/');
}

function endpointContainsItem(endpoint, item) {
    const wsId = item.workspaceId || item.id;
    return String(endpoint.workspaceId) === String(wsId) && pathWithin(endpoint.path, item.path);
}

function cloneEndpoint(item) {
    return {
        workspaceId: item.workspaceId || item.id,
        id: item.workspaceId || item.id,
        name: item.name,
        path: item.path || '/',
        kind: 'directory',
        type: item.type || item.originalType,
        originalType: item.originalType || item.type,
        repoInfo: item.repoInfo,
        branch: item.branch,
        basePath: item.basePath,
        relayUrl: item.relayUrl,
        sshInfo: item.sshInfo,
        aliasId: item.aliasId
    };
}

function workspaceFor(endpoint) {
    const ws = State.workspaces.find(w => w.id === endpoint.workspaceId || w.id === endpoint.id);
    return ws ? { ...ws, ...endpoint, workspaceId: ws.id, id: ws.id } : endpoint;
}

function endpointItem(endpoint, rel = '', kind = 'directory') {
    const ws = workspaceFor(endpoint);
    return {
        ...ws,
        ...endpoint,
        workspaceId: ws.workspaceId || ws.id || endpoint.workspaceId,
        id: ws.id || endpoint.id,
        path: joinPath(endpoint.path || '/', rel),
        name: rel ? rel.split('/').pop() : endpoint.name,
        kind,
        type: endpoint.type || ws.type,
        originalType: endpoint.originalType || endpoint.type || ws.originalType || ws.type
    };
}

async function readText(item) {
    const raw = await FileSystemProvider.read(item);
    if (raw instanceof Blob) return await raw.text();
    if (raw && raw.base64Content) return atob(raw.base64Content);
    return String(raw ?? '');
}

async function snapshotFolder(endpoint) {
    const root = endpointItem(endpoint, '', 'directory');
    const files = new Map();
    const dirs = new Set(['']);

    async function walk(dirItem, relBase = '') {
        const listed = await FileSystemProvider.list(dirItem);
        const children = Array.isArray(listed) ? listed : (listed.entries || []);
        for (const child of children) {
            const rel = cleanRel(relBase ? `${relBase}/${child.name}` : child.name);
            if (child.kind === 'directory') {
                dirs.add(rel);
                await walk(child, rel);
            } else {
                const content = await readText(child);
                files.set(rel, { rel, content, size: content.length });
            }
        }
    }

    await walk(root, '');
    return { files, dirs };
}

async function ensureDir(endpoint, rel) {
    if (!rel) return;
    const parts = cleanRel(rel).split('/').filter(Boolean);
    let current = '';
    for (const part of parts) {
        const parentRel = current.split('/').filter(Boolean).slice(0, -1).join('/');
        current = cleanRel(current ? `${current}/${part}` : part);
        try {
            await FileSystemProvider.create(endpointItem(endpoint, parentRel, 'directory'), part, 'directory');
        } catch (_) {
            // Existing folders are acceptable across providers.
        }
    }
}

async function writeFile(endpoint, rel, content) {
    const parentRel = cleanRel(rel).split('/').slice(0, -1).join('/');
    const fileName = cleanRel(rel).split('/').pop();
    await ensureDir(endpoint, parentRel);
    try {
        await FileSystemProvider.write(endpointItem(endpoint, rel, 'file'), content);
    } catch (_) {
        await FileSystemProvider.create(endpointItem(endpoint, parentRel, 'directory'), fileName, 'file');
        await FileSystemProvider.write(endpointItem(endpoint, rel, 'file'), content);
    }
}

async function deletePath(endpoint, rel, kind) {
    try {
        await FileSystemProvider.delete(endpointItem(endpoint, rel, kind));
    } catch (e) {
        console.warn('[FolderSync] delete skipped:', rel, e.message);
    }
}

function sameFile(a, b) {
    return b && a.content === b.content;
}

export const FolderSync = {
    syncTimers: new Map(),

    init() {
        State.folderSyncLinks = Array.isArray(State.folderSyncLinks) ? State.folderSyncLinks : [];
        window.FolderSync = this;
        window.addEventListener('awtsmoos-login-changed', () => this.applyAllEnabled({ reason: 'login-change' }));
        setTimeout(() => this.applyAllEnabled({ reason: 'startup' }), 1200);
    },

    createLink(sourceItem, targetItem) {
        State.folderSyncLinks = Array.isArray(State.folderSyncLinks) ? State.folderSyncLinks : [];
        const link = {
            id: nowId(),
            enabled: true,
            direction: 'source-to-target',
            deleteExtra: true,
            source: cloneEndpoint(sourceItem),
            target: cloneEndpoint(targetItem),
            createdAt: Date.now(),
            lastRun: null,
            lastStatus: 'created'
        };
        State.folderSyncLinks.push(link);
        App.saveSettings();
        App.saveSession();
        UI.showToast('Folder sync link created.', 'success');
        return link;
    },

    setSource(item) {
        State.pendingSyncSource = cloneEndpoint(item);
        UI.showToast('Sync source selected. Right-click target folder and choose “Sync Here From Selected”.', 'info', 7000);
    },

    async linkTarget(item) {
        if (!State.pendingSyncSource) {
            UI.showToast('Choose “Use as Sync Source” on a folder first.', 'warning');
            return;
        }
        const link = this.createLink(State.pendingSyncSource, item);
        State.pendingSyncSource = null;
        await this.applyLink(link.id, { reason: 'initial-link' });
    },

    toggle(id, enabled) {
        const link = State.folderSyncLinks.find(l => l.id === id);
        if (!link) return;
        link.enabled = enabled;
        App.saveSettings();
        App.saveSession();
        UI.showToast(`Sync link ${enabled ? 'enabled' : 'disabled'}.`, 'info');
    },

    remove(id) {
        State.folderSyncLinks = (State.folderSyncLinks || []).filter(l => l.id !== id);
        App.saveSettings();
        App.saveSession();
        UI.showToast('Sync link removed.', 'info');
    },

    async applyAllEnabled(options = {}) {
        const links = (State.folderSyncLinks || []).filter(l => l.enabled);
        for (const link of links) await this.applyLink(link.id, options);
    },

    scheduleForItem(item, options = {}) {
        if (!item) return;
        const links = (State.folderSyncLinks || []).filter(link =>
            link.enabled && link.source && endpointContainsItem(link.source, item)
        );

        for (const link of links) {
            clearTimeout(this.syncTimers.get(link.id));
            const timer = setTimeout(() => {
                this.syncTimers.delete(link.id);
                this.applyLink(link.id, { reason: options.reason || 'source-change' });
            }, Number(options.delayMs || 900));
            this.syncTimers.set(link.id, timer);
            link.lastStatus = 'queued from source change';
        }

        if (links.length) {
            App.saveSettings();
            App.saveSession();
        }
    },

    async applyLink(id, options = {}) {
        const link = (State.folderSyncLinks || []).find(l => l.id === id);
        if (!link || !link.enabled) return;

        const taskId = 'folder-sync-' + id;
        UI.startTask(taskId, `Syncing ${link.source.name || 'source'} → ${link.target.name || 'target'}...`);
        link.lastStatus = 'running';
        link.lastRun = Date.now();

        try {
            const source = await snapshotFolder(link.source);
            const target = await snapshotFolder(link.target);

            let writes = 0;
            let deletes = 0;
            let processed = 0;
            const total = source.files.size + (link.deleteExtra ? target.files.size : 0);

            for (const [rel, sourceFile] of source.files) {
                processed++;
                UI.updateTask(taskId, total ? (processed / total) * 100 : 50, `Writing ${rel}`);
                const targetFile = target.files.get(rel);
                if (!sameFile(sourceFile, targetFile)) {
                    await writeFile(link.target, rel, sourceFile.content);
                    writes++;
                }
            }

            if (link.deleteExtra) {
                for (const [rel] of target.files) {
                    processed++;
                    if (!source.files.has(rel)) {
                        UI.updateTask(taskId, total ? (processed / total) * 100 : 90, `Deleting ${rel}`);
                        await deletePath(link.target, rel, 'file');
                        deletes++;
                    }
                }
            }

            link.lastStatus = `ok: ${writes} writes, ${deletes} deletes`;
            link.lastRun = Date.now();
            App.saveSettings();
            App.saveSession();
            UI.endTask(taskId, 'success', `Folder sync done: ${writes} writes, ${deletes} deletes.`);
            try { Workspaces.refreshNode(endpointItem(link.target, '', 'directory')); } catch (_) {}
        } catch (e) {
            link.lastStatus = 'error: ' + e.message;
            App.saveSettings();
            App.saveSession();
            UI.endTask(taskId, 'error', 'Folder sync failed: ' + e.message);
            console.error('[FolderSync] failed', e);
        }
    },

    async showManager() {
        const rows = (State.folderSyncLinks || []).map(link => `
            <div style="border:1px solid var(--color-border);border-radius:8px;padding:10px;margin-bottom:8px;background:rgba(255,255,255,.03);">
                <div style="font-weight:bold;">🔗 ${link.source.name || link.source.path} → ${link.target.name || link.target.path}</div>
                <div style="font-size:.85em;opacity:.8;overflow-wrap:anywhere;">${link.source.path} → ${link.target.path}</div>
                <div style="font-size:.85em;opacity:.8;">${link.lastStatus || 'never run'}</div>
                <div style="display:flex;gap:8px;margin-top:8px;">
                    <button data-sync-run="${link.id}" class="primary-btn">Run</button>
                    <button data-sync-toggle="${link.id}" class="secondary-btn">${link.enabled ? 'Disable' : 'Enable'}</button>
                    <button data-sync-remove="${link.id}" class="secondary-btn">Remove</button>
                </div>
            </div>`).join('') || '<div style="opacity:.75;">No folder links yet.</div>';

        UI.showDialog({ title: 'Folder Sync Links', contentHTML: `<div style="text-align:left;max-height:420px;overflow:auto;">${rows}</div>`, okText: 'Close', cancelText: '' });
        setTimeout(() => {
            document.querySelectorAll('[data-sync-run]').forEach(btn => btn.onclick = () => this.applyLink(btn.dataset.syncRun, { reason: 'manual' }));
            document.querySelectorAll('[data-sync-toggle]').forEach(btn => btn.onclick = () => {
                const link = State.folderSyncLinks.find(l => l.id === btn.dataset.syncToggle);
                if (link) this.toggle(link.id, !link.enabled);
            });
            document.querySelectorAll('[data-sync-remove]').forEach(btn => btn.onclick = () => this.remove(btn.dataset.syncRemove));
        }, 50);
    }
};
