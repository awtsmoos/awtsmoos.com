
// B"H
import { UI } from '../../ui.js';
import { State } from '../../state.js';
import { Tabs } from '../../tabs/index.js';
import { ZipState } from '../state.js';
import { ZipRenderer } from '../render.js';
import { ZipUtils } from './utils.js';

export const ZipModify = {
    async createItem(zipTab, kind) {
        const name = await UI.showDialog({
            title: `New ${kind === 'directory' ? 'Folder' : 'File'} in Zip`,
            hasInput: true,
            placeholder: 'path/to/item'
        });
        
        if (!name) return;
        
        try {
            await this.createEntry(zipTab, name, kind);
        } catch (e) {
            UI.showToast(e.message, "error");
        }
    },

    async createEntry(zipTab, path, kind) {
        const state = zipTab.zipState;
        if (!state) return;

        const currentEntries = ZipState.getDisplayEntries(state);
        if (currentEntries.some(e => e.filename === path)) {
            throw new Error("Item already exists!");
        }

        const isDir = kind === 'directory';
        state.newEntries.set(path, { isDir });
        state.modifications.set(path, isDir ? new Uint8Array(0) : "");
        
        ZipUtils.markDirty(zipTab);
        ZipRenderer.render(zipTab, (await import('./index.js')).ZipOps);
    },

    async deleteItem(zipTab, filename) {
        const confirmed = await UI.showDialog({
            title: "Delete from Zip",
            message: `Are you sure you want to delete "${filename}"?`,
            okText: "Delete",
            cancelText: "Cancel"
        });
        
        if (confirmed) this.deleteEntry(zipTab, filename);
    },

    deleteEntry(zipTab, filename) {
        const state = zipTab.zipState;
        if (!state) return;

        state.deletedPaths.add(filename);
        state.modifications.delete(filename);
        state.newEntries.delete(filename); 
        
        const openTab = State.tabs.find(t => t.item.type === 'zip-entry' && t.item.path === filename && t.item.zipTabId === state.tabId);
        if (openTab) Tabs.close(openTab.id, true);

        ZipUtils.markDirty(zipTab);
        import('./index.js').then(m => ZipRenderer.render(zipTab, m.ZipOps));
    },

    updateEntry(zipTab, filename, content) {
        const state = zipTab.zipState;
        if (!state) return;

        state.modifications.set(filename, content);
        if (state.deletedPaths.has(filename)) state.deletedPaths.delete(filename);

        const inOriginal = state.entries.some(e => e.filename === filename);
        const inNew = state.newEntries.has(filename);
        
        if (!inOriginal && !inNew) {
            state.newEntries.set(filename, { isDir: false });
        }

        UI.showToast(`Updated ${filename} in archive memory.`, 'success');
        ZipUtils.markDirty(zipTab);
        
        if (State.activeTabId === zipTab.id) {
            import('./index.js').then(m => ZipRenderer.render(zipTab, m.ZipOps));
        }
    }
};
