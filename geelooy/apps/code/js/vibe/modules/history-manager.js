//B"H
/**
 * --- HISTORY MANAGER ---
 * Responsible for archiving the chat history into a file within the workspace.
 * This ensures the Divine flow of conversation is not lost.
 */
import { FileSystemProvider } from '../../fs-provider.js';
import { UI } from '../../ui.js';
import { State } from '../../state.js';

export const HistoryManager = {
    /**
     * B"H - Reconstitutes history from the .awtsmoos-vibe.json file.
     */
    async load(folderItem) {
        try {
            const historyFile = { ...folderItem, path: `${folderItem.path}/.awtsmoos-vibe.json`, kind: 'file' };
            const rawContent = await FileSystemProvider.read(historyFile);
            const content = typeof rawContent === 'string' ? rawContent : await rawContent.text();
            const data = JSON.parse(content);
            return data.history || [];
        } catch(e) {
            return [];
        }
    },

    /**
     * B"H - Manifests the current session history into the workspace.
     */
    async save(tab) {
        if (!tab || !tab.vibeSession) return;
        
        UI.showLoading("Archiving session...");
        try {
            const workspaceId = tab.item.workspaceId;
            const workspace = State.workspaces.find(ws => ws.id === workspaceId);
            const historyPath = `${tab.vibeSession.rootPath}/.awtsmoos-vibe.json`;
            
            const historyFile = { ...workspace, path: historyPath, kind: 'file', workspaceId };
            
            const data = {
                history: tab.vibeSession.history
            };
            
            await FileSystemProvider.write(historyFile, JSON.stringify(data, null, 2));
            tab.isDirty = false;
            UI.showToast("B\"H: Session history saved to workspace.", "success");
        } catch(e) {
            UI.showToast("Persistence failure: " + e.message, "error");
        } finally {
            UI.hideLoading();
        }
    }
};
