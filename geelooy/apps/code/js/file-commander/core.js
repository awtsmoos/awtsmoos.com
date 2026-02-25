
// B"H
// FILE: js/file-commander/core.js

import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';

export const FileCommanderCore = {
    // B"H - Stateless Navigation
    async navigate(item) {
        // 1. Virtual Root Logic
        if (item.kind === 'root') {
            const files = State.workspaces.map(ws => ({
                name: ws.name,
                kind: 'directory',
                path: '/', 
                workspaceId: ws.id,
                type: ws.type,
                repoInfo: ws.repoInfo,
                isWorkspaceRoot: true
            }));
            return { currentPathItem: item, currentFiles: files };
        }

        // 2. Directory Listing
        if (!item || item.kind !== 'directory') {
            throw new Error("Item is not a directory");
        }
        
        try {
            const files = await FileSystemProvider.list(item);
            const fileList = Array.isArray(files) ? files : (files.entries || []);
            
            // B"H - Ensure every file knows its workspace context
            const enrichedFiles = fileList.map(f => ({
                ...f,
                workspaceId: item.workspaceId,
                // Inherit type if not present (crucial for git/ssh/etc)
                type: f.type || item.type, 
                originalType: f.originalType || item.originalType
            }));

            return { currentPathItem: item, currentFiles: enrichedFiles };
        } catch(e) {
            console.error(e);
            throw e;
        }
    },

    getParent(currentItem) {
        if (!currentItem) return null;
        if (currentItem.kind === 'root') return null;
        
        // If we are at the root of a workspace, go back to Global Root
        if ((currentItem.path === '/' || currentItem.path === '') && !currentItem.isWorkspaceRoot) {
             return { kind: 'root', name: 'Workspaces', path: '/' };
        }
        // If we are explicitly at a workspace root
        if (currentItem.isWorkspaceRoot) {
             return { kind: 'root', name: 'Workspaces', path: '/' };
        }
        
        // Calculate parent path
        let parentPath = currentItem.path.substring(0, currentItem.path.lastIndexOf('/'));
        if (!parentPath) parentPath = '/';
        
        // B"H - CRITICAL FIX: Preserve Workspace Context
        return { 
            ...currentItem, // Copies workspaceId, type, originalType, etc.
            path: parentPath, 
            name: parentPath === '/' ? 'Root' : parentPath.split('/').pop(),
            kind: 'directory' 
        };
    }
};
