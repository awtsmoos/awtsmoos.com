
// B"H
import { State } from '../state.js';
import { UI } from '../ui.js';
import { Editor } from '../editor.js';
import { App } from '../app.js';
import { Tabs } from './index.js';
import { TabsPersistence } from './persistence.js';

export const TabsLifecycle = {
    async close(tabId, force = false) {
        const idx = State.tabs.findIndex(t => t.id === tabId);
        if (idx === -1) return;

        const tab = State.tabs[idx];
        
        // B"H - Exclude autonomous tabs from the mortal 'save' prompt
        const autoManagedTypes = ['vibe', 'commander', 'terminal', 'devtools', 'html-preview', 'vibe-session', 'vibe-manager'];
        
        // Ensure both fileType and the underlying item.type are checked
        const isAutonomous = autoManagedTypes.includes(tab.fileType) || 
                             (tab.item && autoManagedTypes.includes(tab.item.type)) ||
                             tab.isPreview;

        const needsSavePrompt = tab.isDirty && !force && !isAutonomous;

        if (needsSavePrompt) {
            const res = await UI.showDialog({ title: "Unsaved Changes", message: `Save changes to ${tab.item.name}?`, okText: "Save", cancelText: "Discard" });
            if (res === true) await TabsPersistence.save(tab, Tabs);
            else if (res === null) return; 
        }

        if (tab.fileType === 'html-preview' || tab.isPreview) {
            Editor.closePreviewer(tab.id);
            const dtTab = State.tabs.find(t => t.fileType === 'devtools' && t.devtoolsState?.previewTabId === tab.id);
            if (dtTab) this.close(dtTab.id, true);
        }

        State.tabs.splice(idx, 1);
        if (State.activeTabId === tabId) {
            const next = State.tabs[idx] || State.tabs[idx - 1] || null;
            await Tabs.activate(next ? next.id : null);
        } else {
            Tabs.render();
        }
        App.saveSession();
    },

    async saveActive() {
        const tab = State.tabs.find(t => t.id === State.activeTabId);
        if (tab) await TabsPersistence.save(tab, Tabs);
    }
};
