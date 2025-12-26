//B"H
/**
 * --- HISTORY SCRIBE ---
 * Recording the Speech of the AI and User into a physical vessel within the workspace.
 * B"H - Ensuring that the Divine timestream is preserved between sessions.
 */
import { FileSystemProvider } from '../../fs-provider.js';
import { State } from '../../state.js';
import { UI } from '../../ui.js';

export const HistoryScribe = {
    /**
     * B"H - Loads the history from the .awtsmoos-vibe.json file.
     * @param {object} folderItem - The folder being "vibe coded".
     */
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

    /**
     * B"H - Saves the current session history into the workspace.
     * @param {object} tab - The Vibe tab.
     */
    async save(tab) {
        if (!tab || !tab.vibeSession) return;
        
        UI.showLoading("Archiving the Timestream...");
        try {
            const workspaceId = tab.item.workspaceId;
            const workspace = State.workspaces.find(ws => ws.id === workspaceId);
            const historyPath = `${tab.vibeSession.rootPath}/.awtsmoos-vibe.json`;
            
            const file = { ...workspace, path: historyPath, kind: 'file', workspaceId };
            
            // B"H - Filter history to remove the giant system context messages during save
            const saveHistory = tab.vibeSession.history.filter(m => m.role !== 'system');
            const data = { history: saveHistory };
            
            await FileSystemProvider.write(file, JSON.stringify(data, null, 2));
            tab.isDirty = false;
            UI.showToast("B\"H: Session archived to .awtsmoos-vibe.json", "success");
        } catch(e) {
            UI.showToast("B\"H: Persistence failure: " + e.message, "error");
        } finally {
            UI.hideLoading();
        }
    }
};
