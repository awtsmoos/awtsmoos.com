// B"H
// FILE: js/fs/os-folder.js
import { State } from '../state.js';

export const OSFolderProvider = {
    _requestFromOS(type, payload) {
        return new Promise((resolve, reject) => {
            const requestId = State.postMessageRequestId++;
            State.postMessagePendingRequests.set(requestId, { resolve, reject });
            window.parent.postMessage({ type, payload, requestId }, '*');
            setTimeout(() => {
                if (State.postMessagePendingRequests.has(requestId)) {
                    State.postMessagePendingRequests.delete(requestId);
                    reject(new Error(`Request timed out: ${type}`));
                }
            }, 10000);
        });
    },
    
    async list(item) {
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        if (!workspace || workspace.type !== 'osfolder') throw new Error("Could not find OS folder workspace.");

        const basePath = workspace.path;
        const pathForOSRequest = item.path === '/' ? basePath : `${basePath}${item.path}`;

        const response = await this._requestFromOS('requestFolderList', { path: pathForOSRequest });
 
        return response.items.map(itemName => {
            // Determine if it's a folder based on extension or OS hint if available
            // For now, relying on user logic from previous code (e.g. .folder suffix or implicit)
            const isDir = itemName.endsWith('.folder') || !itemName.includes('.'); 
            
            return {
                name: itemName, 
                kind: isDir ? 'directory' : 'file',
                path: item.path === '/' ? `/${itemName}` : `${item.path}/${itemName}`
            };
        });
    },

    async read(item) {
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        const fullOSPath = `${workspace.path}${item.path}`;
        const parentPath = fullOSPath.substring(0, fullOSPath.lastIndexOf('/'));
        const fileName = fullOSPath.substring(fullOSPath.lastIndexOf('/') + 1);

        const response = await this._requestFromOS('requestFileContent', { path: parentPath, fileName: fileName });
        return response.content;
    },
    
    async write(item, content) {
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        const fullOSPath = `${workspace.path}${item.path}`;
        await this._requestFromOS('requestFileWrite', { fullPath: fullOSPath, content: content });
    },

    async create(parentDir, name, kind) {
        const workspace = State.workspaces.find(ws => ws.id === parentDir.workspaceId);
        const parentOSPath = parentDir.path === '/' ? workspace.path : `${workspace.path}${parentDir.path}`;
        const finalName = kind === 'directory' && !name.endsWith('.folder') ? `${name}.folder` : name;

        await this._requestFromOS('requestItemCreate', { parentPath: parentOSPath, name: finalName, kind: kind });
    },
    
    async delete(item) {
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        const fullOSPath = `${workspace.path}${item.path}`;
        await this._requestFromOS('requestItemDelete', { fullPath: fullOSPath, kind: item.kind });
    }
};