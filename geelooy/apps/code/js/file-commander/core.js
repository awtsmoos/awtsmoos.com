// B"H
// FILE: js/file-commander/core.js

import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';
import { UI } from '../ui.js';

export const FileCommanderCore = {
    currentPathItem: null,
    currentFiles: [],

    async navigate(item, callback) {
        // B"H - Virtual Root Navigation
        if (item.kind === 'root') {
            this.currentPathItem = item;
            this.currentFiles = State.workspaces.map(ws => ({
                name: ws.name,
                kind: 'directory',
                path: '/', // Root of the workspace
                workspaceId: ws.id,
                type: ws.type,
                repoInfo: ws.repoInfo,
                isWorkspaceRoot: true
            }));
            if (callback) callback();
            return;
        }

        if (!item || item.kind !== 'directory') return;
        
        this.currentPathItem = item;
        
        // Use a lightweight task instead of blocking modal
        const taskId = `fc-nav-${Date.now()}`;
        UI.startTask(taskId, "Listing files...");
        
        try {
            const files = await FileSystemProvider.list(item);
            this.currentFiles = Array.isArray(files) ? files : [];
            if (callback) callback();
            UI.endTask(taskId, 'success', `Loaded ${this.currentFiles.length} items`);
        } catch(e) {
            console.error(e);
            UI.endTask(taskId, 'error', "Failed: " + e.message);
        }
    },

    getParent() {
        if (!this.currentPathItem) return null;
        if (this.currentPathItem.kind === 'root') return null;
        if (this.currentPathItem.path === '/' && !this.currentPathItem.isWorkspaceRoot) {
             return { kind: 'root', name: 'Workspaces', path: '/' };
        }
        
        const parentPath = this.currentPathItem.path.substring(0, this.currentPathItem.path.lastIndexOf('/')) || '/';
        return { ...this.currentPathItem, path: parentPath, kind: 'directory' };
    }
};