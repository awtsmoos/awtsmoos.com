
// B"H
/**
 * @file LoopEngine.js
 * @brief The Physical Hand of the Vibe System. Optimized for speed and clarity.
 */

import { State } from '../../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces/index.js';
import { UI } from '../../ui.js';
import { GitMetaProvider } from '../../git/meta.js';
import { VibeDB } from '../db.js';

export const LoopEngine = {
    _knownDirectories: new Set(),

    async apply(changeList, workspaceId, sessionId = null, skipSnapshot = false) {
        if (!changeList || changeList.length === 0) return;

        const workspace = State.workspaces.find(ws => String(ws.id) === String(workspaceId));
        if (!workspace) return;
        
        const physicalType = workspace.originalType || workspace.type;
        const parentsToRefresh = new Set();
        const timelineChanges = [];
        let totalNewBytes = 0;
        
        for (let i = 0; i < changeList.length; i++) {
            const change = changeList[i];
            const taskId = `vibe-apply-${Date.now()}-${i}`;
            
            // B"H - The Tikkun: Show complete path with CSS wrapping support
            const displayPath = change.path.startsWith('/') ? change.path : '/' + change.path;
            UI.startTask(taskId, `Manifest of: ${displayPath}`);
            
            const item = { 
                ...workspace, 
                path: change.path, 
                kind: 'file', 
                workspaceId: workspaceId, 
                type: physicalType,
                originalType: physicalType
            };

            if (!skipSnapshot && sessionId) {
                let oldContent = null;
                try {
                    const raw = await FileSystemProvider.read(item);
                    oldContent = (raw instanceof Blob) ? await raw.text() : String(raw);
                } catch(e) {}
                
                const newContent = change.operation === 'delete' ? null : change.content;
                totalNewBytes += newContent ? newContent.length : 0;
                
                timelineChanges.push({
                    path: change.path,
                    operation: change.operation,
                    oldContent: oldContent,
                    newContent: newContent
                });
            }

            try {
                if (change.operation === 'delete') {
                    await FileSystemProvider.delete(item);
                } else {
                    await this._ensureDirectoryExists(workspace, change.path, physicalType);
                    await FileSystemProvider.write(item, change.content);
                }

                const lastSlash = change.path.lastIndexOf('/');
                const parentPath = lastSlash <= 0 ? "/" : change.path.substring(0, lastSlash);
                parentsToRefresh.add(parentPath);

                UI.endTask(taskId, 'success', `Saved: ${displayPath}`);
            } catch (err) {
                UI.endTask(taskId, 'error', `Blocked: ${displayPath}`);
            }
            
            const openTab = State.tabs.find(t => t.item.path === change.path && String(t.item.workspaceId) === String(workspaceId));
            if (openTab && change.operation !== 'delete') {
                openTab.content = change.content;
                openTab.isDirty = false;
                openTab.isUncommitted = true;
                if (State.activeTabId === openTab.id) {
                    const { Editor } = await import('../../editor.js');
                    if (Editor && Editor.setCurrentContent) Editor.setCurrentContent(change.content);
                }
            }
        }

        if (!skipSnapshot && sessionId && timelineChanges.length > 0) {
            await VibeDB.saveTimelineRecord({
                id: Date.now().toString(),
                sessionId: sessionId,
                workspaceId: workspaceId,
                timestamp: Date.now(),
                sizeBytes: totalNewBytes,
                changes: timelineChanges
            });
        }

        for (const p of parentsToRefresh) {
            await Workspaces.refreshNode({ ...workspace, path: p, kind: 'directory', workspaceId, type: physicalType });
        }
        const { Tabs } = await import('../../tabs/index.js');
        if (Tabs && Tabs.render) Tabs.render();
    },
    
    async _ensureDirectoryExists(workspace, filePath, physicalType) {
        const segments = filePath.split('/').filter(Boolean);
        if (segments.length <= 1) return;
        segments.pop(); 
        let currentPath = "";
        const wsKey = String(workspace.id);
        
        for (const segment of segments) {
            currentPath += "/" + segment;
            const cacheKey = `${wsKey}::${currentPath}`;
            if (this._knownDirectories.has(cacheKey)) continue;
            try {
                const parentItem = { ...workspace, path: currentPath.substring(0, currentPath.lastIndexOf('/')) || "/", kind: 'directory', type: physicalType };
                await FileSystemProvider.create(parentItem, segment, 'directory');
            } catch (e) {}
            this._knownDirectories.add(cacheKey);
        }
    }
};
