
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
                    reject(new Error("Request timed out: " + type));
                }
            }, 10000);
        });
    },

    _getOSPath(workspacePath, itemPath) {
        let p = itemPath === '/' ? '' : itemPath;
        if (p && !p.startsWith('/')) p = '/' + p; 
        if (p.startsWith(workspacePath)) return p;
        return (workspacePath + p).replace(/\/+/g, '/');
    },
    
    async list(item) {
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        if (!workspace || workspace.type !== 'osfolder') throw new Error("Could not find OS folder workspace.");

        const pathForOSRequest = this._getOSPath(workspace.path, item.path);
        const response = await this._requestFromOS('requestFolderList', { path: pathForOSRequest });
        
        if (response.error) throw new Error(response.error);
        if (!response.items) return [];
 
        return response.items.map(itemData => {
            const name = typeof itemData === 'string' ? itemData : itemData.name;
            let kind = itemData.kind;
            if (!kind) {
                 kind = (name.endsWith('.folder') || !name.includes('.')) ? 'directory' : 'file';
            }
            
            return {
                name: name, 
                kind: kind === 'directory' ? 'directory' : 'file',
                path: (item.path === '/' ? '' : item.path) + '/' + name,
                size: itemData.size || 0,
                lastModified: itemData.lastModified || 0
            };
        });
    },

    async read(item) {
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        const fullOSPath = this._getOSPath(workspace.path, item.path);
        const parentPath = fullOSPath.substring(0, fullOSPath.lastIndexOf('/'));
        const fileName = fullOSPath.substring(fullOSPath.lastIndexOf('/') + 1);

        const response = await this._requestFromOS('requestFileContent', { path: parentPath, fileName: fileName });
        
        // B"H - Rectification: Ensure honest reporting of void elements
        if (response.error) throw new Error(response.error);
        if (response.content === undefined || response.content === null) {
            throw new Error("The physical vessel " + fileName + " returned an empty void.");
        }
        
        return response.content;
    },
    
    async write(item, content) {
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        const fullOSPath = this._getOSPath(workspace.path, item.path);
        const response = await this._requestFromOS('requestFileWrite', { fullPath: fullOSPath, content: content });
        if (response.error) throw new Error(response.error);
    },

    async create(parentDir, name, kind) {
        const workspace = State.workspaces.find(ws => ws.id === parentDir.workspaceId);
        const parentOSPath = this._getOSPath(workspace.path, parentDir.path);
        const finalName = kind === 'directory' && !name.endsWith('.folder') ? name + '.folder' : name;

        const response = await this._requestFromOS('requestItemCreate', { parentPath: parentOSPath, name: finalName, kind: kind });
        if (response.error) throw new Error(response.error);
    },
    
    async delete(item) {
        const workspace = State.workspaces.find(ws => ws.id === item.workspaceId);
        const fullOSPath = this._getOSPath(workspace.path, item.path);
        const response = await this._requestFromOS('requestItemDelete', { fullPath: fullOSPath, kind: item.kind });
        if (response.error) throw new Error(response.error);
    }
};
