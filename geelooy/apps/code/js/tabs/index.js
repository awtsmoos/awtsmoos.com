
// B"H
// FILE: js/tabs/index.js
import { TabFactory } from './factory.js';
import { TabOrchestrator } from './orchestrator.js';
import { TabsRenderer } from './rendering.js';
import { TabsLifecycle } from './lifecycle.js';
import { TabPathRitual } from './path-ritual.js';
import { State } from '../state.js';

export const Tabs = {
    getUniquePath: TabPathRitual.getUniquePath,
    
    async create(item, isNewFile = false, shouldSave = true, activate = true) {
        const { tab, isNew } = TabFactory.create(item, isNewFile);
        if (activate) await TabOrchestrator.activate(tab.id);
        else this.render();
        
        if (shouldSave && isNew) {
            import('../app.js').then(m => m.App.saveSession());
        }
        return tab;
    },

    async createPreview(item, content) {
        // B"H - THE CORE RECTIFICATION: Preserve originalType
        const physicalType = item.originalType || item.type;
        
        const previewItem = { 
            ...item, 
            type: 'html-preview-file', 
            originalType: physicalType,
            isPreview: true 
        };
        
        const uniquePath = TabPathRitual.getUniquePath(previewItem);
        const existing = State.tabs.find(t => t.uniquePath === uniquePath);
        
        if (existing) {
            existing.content = content; 
            existing.forceReload = true;
            await this.activate(existing.id, true);
            return;
        }

        const { tab, isNew } = TabFactory.create(previewItem, false);
        tab.content = content;
        tab.item.name = "Preview: " + item.name;
        
        this.render();
        if (isNew) import('../app.js').then(m => m.App.saveSession());
        await this.activate(tab.id);
    },

    updatePreviewContext(tabId, newItem) {
        const tab = State.tabs.find(t => t.id === tabId);
        if (tab) {
            const physicalType = newItem.originalType || newItem.type;
            tab.item = { 
                ...newItem, 
                type: 'html-preview-file', 
                originalType: physicalType,
                isPreview: true, 
                name: "Preview: " + newItem.name 
            };
            tab.uniquePath = TabPathRitual.getUniquePath(tab.item);
            this.render();
        }
    },

    async createTemporary() {
        const tempItem = {
            name: "Untitled-" + Math.floor(Math.random() * 1000) + ".txt",
            path: "/temp/Untitled-" + Math.floor(Math.random() * 1000) + ".txt",
            kind: 'file',
            type: 'temp',
            workspaceId: 'global'
        };
        await this.create(tempItem, true);
    },

    downloadActive() {
        import('./persistence.js').then(m => m.TabsPersistence.downloadActive(this));
    },

    async reopenLastClosed() {
        const last = State.closedTabHistory.pop();
        if (last) {
            await this.create(last.item, false, true, true);
        }
    },

    activate: (id, force) => TabOrchestrator.activate(id, force),
    close: (id, force) => TabsLifecycle.close(id, force),
    render: () => TabsRenderer.render(document.getElementById('tab-bar'), Tabs),
    saveActive: () => TabsLifecycle.saveActive()
};
