
// B"H
/**
 * @file loader.js
 * @brief The Alchemist of File Essence.
 */
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { EditorCore } from '../editor/core.js';
import { PreviewManager } from '../editor/preview-manager.js';
import { ZipExplorer } from '../zip/zip-explorer.js';

export const TabsLoader = {
    /**
     * @async
     * @function loadTabContent
     * @description Penetrates the FileSystem to pull the raw soul of a file.
     */
    async loadTabContent(tab) {
        console.log(`B"H - [Loader] Requesting essence for: ${tab.item.path}`);
        try {
            UI.showLoading(`Reading ${tab.item.name}...`);
            
            // 1. Raw Retrieval
            const lookupItem = { ...tab.item, type: tab.item.originalType || tab.item.type };
            let raw = await FileSystemProvider.read(lookupItem);
            
            if (raw === undefined || raw === null) {
                throw new Error("FileSystem returned void essence.");
            }

            console.log(`B"H - [Loader] Raw data type detected: ${typeof raw} / IsBlob: ${raw instanceof Blob}`);

            // 2. Transmutation to Text
            let text = "";
            if (typeof raw === 'string') {
                text = raw;
            } else if (raw instanceof Blob) {
                text = await raw.text();
            } else if (raw.base64Content) {
                text = atob(raw.base64Content);
            } else {
                text = String(raw);
            }

            // 3. State Inscription
            tab.content = text;
            tab.rawContent = raw;
            console.log(`B"H - [Loader] Successfully parsed ${text.length} characters.`);
            return true;
        } catch (e) {
            console.error(`B"H - [Loader] Retrieval Shevirah:`, e);
            UI.showToast(`Error reading ${tab.item.name}: ${e.message}`, "error");
            return false;
        } finally {
            UI.hideLoading();
        }
    },

    async renderTabView(tab, forceReload) {
        console.log(`B"H - [Loader] Routing render view for: ${tab.fileType}`);
        if (tab.fileType === 'zip') {
            await ZipExplorer.open(tab.rawContent, tab);
        } else if (tab.isPreview || tab.fileType === 'html-preview') {
            PreviewManager.show(tab.id, tab.item, tab.rawContent, forceReload);
        } else {
            await EditorCore.showTextEditor(tab.content || "", tab.item.name, tab.scrollPos || 0);
        }
    }
};
