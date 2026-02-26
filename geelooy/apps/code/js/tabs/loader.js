
// B"H
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { ZipExplorer } from '../zip/zip-explorer.js';
import { Editor } from '../editor.js';

export const TabsLoader = {
    async loadTabContent(tab) {
        try {
            UI.showLoading(`Opening ${tab.item.name}...`);
            let fileContent;
            
            if (tab.item.type === 'zip-entry' || tab.item.type === 'temp') {
                fileContent = tab.content;
            } else {
                try {
                    fileContent = await FileSystemProvider.IndexedDB.readUncommitted(tab.uniquePath);
                    tab.isUncommitted = true;
                } catch (e) {
                    const lookupItem = { ...tab.item, type: tab.item.originalType || tab.item.type };
                    fileContent = await FileSystemProvider.read(lookupItem);
                }
            }

            if (tab.item.name.toLowerCase().endsWith('.zip')) {
                tab.fileType = 'zip';
                tab.rawContent = (fileContent instanceof Blob) ? fileContent : new Blob([fileContent]);
            } else {
                tab.rawContent = fileContent;
                if (typeof fileContent === 'string') tab.content = fileContent;
                else if (fileContent instanceof Blob) tab.content = await fileContent.text();
                else tab.content = String(fileContent);
            }
            return true;
        } catch (e) {
            UI.showToast(`Error reading file: ${e.message}`, "error");
            return false;
        } finally {
            UI.hideLoading();
        }
    },

    async renderTabView(tab, forceReload) {
        if (tab.fileType === 'zip') await ZipExplorer.open(tab.rawContent, tab);
        else if (tab.fileType === 'text') await Editor.showTextEditor(tab.content || "", tab.item.name, tab.scrollPos || 0);
        else if (tab.isHexView) UI.switchView('hex');
        else Editor.showPreviewer(tab.rawContent, { type: tab.fileType, name: tab.item.name }, tab.id, forceReload);
    }
};
