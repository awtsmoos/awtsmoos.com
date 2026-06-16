// B"H
import { State } from '../state.js';
import { PostMessageOsFsAdapter } from '../../../../shared/virtual-os/fs/adapters/PostMessageOsFsAdapter.js';

/**
 * B"H
 * Chapter 53: The embedded OS folder bridge found the true shared path.
 */
export const OSFolderProvider = {
    _requestFromOS(type, payload) {
        return new Promise((resolve, reject) => {
            const requestId = State.postMessageRequestId++;
            State.postMessagePendingRequests.set(requestId, { resolve, reject });
            window.parent.postMessage({ type, payload, requestId }, '*');
            setTimeout(() => {
                if (State.postMessagePendingRequests.has(requestId)) {
                    State.postMessagePendingRequests.delete(requestId);
                    reject(new Error("Request timed out: " + type));
                }
            }, 10000);
        });
    },

    _adapter() {
        return new PostMessageOsFsAdapter({ request: (type, payload) => this._requestFromOS(type, payload) });
    },

    _getOSPath(workspacePath, itemPath) {
        let p = itemPath === '/' ? '' : itemPath;
        if (p && !p.startsWith('/')) p = '/' + p;
        if (p.startsWith(workspacePath)) return p.replace(/^\/+/, '');
        return (workspacePath + p).replace(/\/+/g, '/').replace(/^\/+/, '');
    },

    _workspace(item) {
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        if (!workspace || workspace.type !== 'osfolder') throw new Error("Could not find OS folder workspace.");
        return workspace;
    },

    _path(item) {
        const workspace = this._workspace(item);
        return this._getOSPath(workspace.path, item.path);
    },

    async list(item) {
        const got = await this._adapter().run({ action: 'list', path: this._path(item) });
        if (!got.ok) throw new Error(got.error);
        return got.detailedItems.map(entry => ({
            name: entry.name,
            kind: entry.kind === 'directory' ? 'directory' : 'file',
            path: (item.path === '/' ? '' : item.path) + '/' + entry.name,
            size: entry.size || 0,
            lastModified: entry.lastModified || 0
        }));
    },

    async read(item) {
        const got = await this._adapter().run({ action: 'read', path: this._path(item) });
        if (!got.ok) throw new Error(got.error);
        if (got.content === undefined || got.content === null) throw new Error("The physical vessel " + item.name + " returned an empty void.");
        return got.content;
    },

    async write(item, content) {
        const got = await this._adapter().run({ action: 'write', path: this._path(item), content });
        if (!got.ok) throw new Error(got.error);
    },

    async create(parentDir, name, kind) {
        const workspace = this._workspace(parentDir);
        const parentOSPath = this._getOSPath(workspace.path, parentDir.path);
        const finalName = kind === 'directory' && !name.endsWith('.folder') ? name + '.folder' : name;
        const path = (parentOSPath === '.' ? finalName : `${parentOSPath}/${finalName}`).replace(/\/+/g, '/');
        const got = await this._adapter().run({ action: kind === 'directory' ? 'makeFolder' : 'write', path, content: '' });
        if (!got.ok) throw new Error(got.error);
    },

    async delete(item) {
        const got = await this._adapter().run({ action: 'delete', path: this._path(item), kind: item.kind });
        if (!got.ok) throw new Error(got.error);
    }
};
