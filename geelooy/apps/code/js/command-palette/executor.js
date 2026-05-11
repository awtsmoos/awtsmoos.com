
// B"H
import { State } from '../state.js';
import { Actions } from '../actions/index.js'; 
import { Tabs } from '../tabs/index.js';
import { UI } from '../ui.js';
import { VisualEngine } from '../visuals/index.js';

export const PaletteExecutor = {
    execute(cmd, paletteObj) {
        paletteObj.hide();
        if (cmd.action === 'reload-window') {
            location.reload();
        } else if (cmd.action === 'show-search') {
            import('../search-system.js').then(m => m.SearchSystem.show());
        } else if (cmd.action === 'scope-to-active') {
             const tab = State.tabs.find(t => t.id === State.activeTabId);
             if (tab && tab.item) {
                 const parentPath = tab.item.path.substring(0, tab.item.path.lastIndexOf('/')) || '/';
                 const parentItem = { ...tab.item, path: parentPath, kind: 'directory', name: parentPath.split('/').pop() || 'Root' };
                 import('../search-system.js').then(m => m.SearchSystem.show(parentItem));
             } else {
                 UI.showToast("No active file to scope search.", "warning");
             }
        } else if (cmd.action === 'scope-clear') {
            import('../search-system.js').then(m => { m.SearchSystem.currentScopeItem = null; UI.showToast("Search scope cleared.", "info"); });
        } else if (cmd.action === 'close-tab-direct') {
            if (State.activeTabId) Tabs.close(State.activeTabId);
        } else if (cmd.action === 'open-vibe-context') {
             const tab = State.tabs.find(t => t.id === State.activeTabId);
             if (tab && tab.item) {
                 import('../vibe/vibe-controller.js').then(m => {
                     const parentPath = tab.item.path.substring(0, tab.item.path.lastIndexOf('/')) || '/';
                     const parentItem = { ...tab.item, path: parentPath, kind: 'directory' };
                     m.VibeController.open(parentItem);
                 });
             } else {
                 UI.showToast("No active file to infer Vibe context.", "warning");
             }
        } else if (cmd.action === 'apply-external-ai-context') {
             const tab = State.tabs.find(t => t.id === State.activeTabId);
             if (tab && tab.item) {
                 import('../features/ai-manifestation/index.js').then(m => {
                     const parentPath = tab.item.path.substring(0, tab.item.path.lastIndexOf('/')) || '/';
                     const parentItem = { ...tab.item, path: parentPath, kind: 'directory', workspaceId: tab.item.workspaceId, name: parentPath.split('/').pop() || 'Root' };
                     m.AIManifestation.showDialog(parentItem);
                 });
             } else {
                 UI.showToast("No active file to infer workspace context.", "warning");
             }
        } else if (cmd.action === 'show-graph-nav') {
            VisualEngine.triggerGraphNav();
        } else if (cmd.action === 'open-browser-tab') {
            import('../browser/index.js').then(m => m.BrowserManager.open());
        } else {
            Actions.handle(cmd.action);
        }
    }
};
