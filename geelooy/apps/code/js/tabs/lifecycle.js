
// B"H
import { State } from '../state.js';
import { UI } from '../ui.js';
import { App } from '../app.js';
import { Tabs } from './index.js';
import { TabsPersistence } from './persistence.js';
import { Terminal } from '../terminal/index.js';

export const TabsLifecycle = {
    async close(tabId, force = false) {
        const idx = State.tabs.findIndex(t => t.id === tabId);
        if (idx === -1) return;

        const tab = State.tabs[idx];
        const isAutonomous =['vibe', 'commander', 'terminal', 'devtools', 'html-preview'].includes(tab.fileType) || tab.isPreview;

        if (tab.isDirty && !force && !isAutonomous) {
            UI.showToast(`Auto-saving ${tab.item.name}...`, "info");
            await TabsPersistence.save(tab, Tabs);
        }

        // B"H - THE PURIFICATION RITUAL
        if (tab.fileType === 'terminal' || tab.item.type === 'terminal') {
            Terminal.close(tab.id);
        }

        if (tab.fileType === 'html-preview' || tab.isPreview) {
            import('../editor/preview-manager.js').then(m => m.PreviewManager.remove(tab.id));
            const dtTab = State.tabs.find(t => t.fileType === 'devtools' && t.devtoolsState?.previewTabId === tab.id);
            if (dtTab) this.close(dtTab.id, true);
        }

        // B"H - Remember the fallen vessel
        State.closedTabHistory.push({ ...tab, id: undefined });

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
