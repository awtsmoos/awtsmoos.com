// B"H
/**
 * @file lifecycle.js
 */

import { State } from '../state.js';
import { UI } from '../ui.js';
import { App } from '../app.js';
import { Tabs } from './index.js';
import { TabsPersistence } from './persistence.js';
import { Terminal } from '../terminal/index.js';

export const TabsLifecycle = {
    /**
     * @async
     * @function close
     * @description Dissolves a tab and cleans its dimensional footprint.
     */
    async close(tabId, force = false) {
        const idNum = Number(tabId);
        const idx = State.tabs.findIndex(t => t.id === idNum);
        if (idx === -1) return;

        const tab = State.tabs[idx];
        const isAutonomous = ['vibe', 'commander', 'terminal', 'devtools', 'html-preview', 'browser'].includes(tab.fileType) || tab.isPreview;

        // Auto-save check
        if (tab.isDirty && !force && !isAutonomous) {
            UI.showToast(`Auto-saving \${tab.item.name}...`, "info");
            await TabsPersistence.save(tab, Tabs);
        }

        // --- THE DIMENSIONAL CLEANUP ---
        
        // 1. Terminal dissolution
        if (tab.fileType === 'terminal' || tab.item.type === 'terminal') {
            Terminal.close(tab.id);
        }

        // 2. Preview dissolution
        if (tab.fileType === 'html-preview' || tab.isPreview) {
            import('../editor/preview-manager.js').then(m => m.PreviewManager.remove(tab.id));
            
            // B"H - Also close its linked DevTools
            const linkedDevTools = State.tabs.find(t => t.fileType === 'devtools' && String(t.item.previewTabId) === String(tab.id));
            if (linkedDevTools) {
                console.log(`[Tabs] B"H - Closing linked DevTools vessel for: \${tab.id}`);
                this.close(linkedDevTools.id, true);
            }
        }

        // B"H - Record for the Scroll of Reopening
        State.closedTabHistory.push({ ...tab, id: undefined });

        // Manifest the void
        State.tabs.splice(idx, 1);
        
        // Focus alignment
        if (State.activeTabId === idNum) {
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