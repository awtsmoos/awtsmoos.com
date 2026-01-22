// B"H
// FILE: js/vibe/modules/HistoryScribe.js

import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';
import { UI } from '../../ui.js';

export const HistoryScribe = {
    async load(folderItem) {
        try {
            const historyPath = `${folderItem.path}/.awtsmoos-vibe.json`;
            const file = { ...folderItem, path: historyPath, kind: 'file' };
            const raw = await FileSystemProvider.read(file);
            const content = typeof raw === 'string' ? raw : await raw.text();
            const data = JSON.parse(content);
            return data.history || [];
        } catch(e) {
            return [];
        }
    },

    async save(tab) {
        if (!tab || !tab.vibeSession) return;
        
        UI.showLoading("Archiving the Timestream...");
        try {
            const workspaceId = tab.item.workspaceId;
            const workspace = State.workspaces.find(ws => ws.id === workspaceId);
            // Ensure no double slashes in path
            const root = tab.vibeSession.rootPath === '/' ? '' : tab.vibeSession.rootPath;
            const historyPath = `${root}/.awtsmoos-vibe.json`;
            
            const file = { ...workspace, path: historyPath, kind: 'file', workspaceId };
            
            const saveHistory = tab.vibeSession.history.filter(m => m.role !== 'system');
            const data = { history: saveHistory };
            
            await FileSystemProvider.write(file, JSON.stringify(data, null, 2));
            tab.isDirty = false;
            UI.showToast("B\"H: Session archived.", "success");
        } catch(e) {
            UI.showToast("B\"H: Persistence failure: " + e.message, "error");
        } finally {
            UI.hideLoading();
        }
    }
};