// B"H
// FILE: js/tabs/index.js

import { TabFactory } from './factory.js';
import { TabOrchestrator } from './orchestrator.js';
import { TabsRenderer } from './rendering.js';
import { TabsLifecycle } from './lifecycle.js';
import { TabPathRitual } from './path-ritual.js';
import { State } from '../state.js';

/**
 * @file index.js
 * @description
 * B"H.
 * The tab kingdom is the little firmament above the editor. Each tab is a
 * vessel, and the Awtsmoos gives each vessel one name, one path, one breath.
 * This module refuses the old fracture where an untitled file received two
 * random numbers: one on its crown and another in its footsteps. A newborn
 * temp tab now descends whole, unsaved, virtual, and ready to receive words
 * before any physical filesystem is asked to prove it exists.
 */

/**
 * @function createTemporaryItem
 * @description
 * B"H.
 * Creates one coherent unsaved text vessel. It lives in the editor's inner
 * air, not on disk, until the user saves it into a real provider world.
 *
 * @returns {object} A complete temporary file item for TabFactory.
 */
function createTemporaryItem() {
    const id = Math.floor(Math.random() * 1000);
    const name = `Untitled-${id}.txt`;

    return {
        name,
        path: `/temp/${name}`,
        kind: 'file',
        type: 'temp',
        originalType: 'temp',
        workspaceId: 'global',
        content: '',
        isUnsaved: true,
        isVirtual: true
    };
}

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
            return existing;
        }

        const { tab, isNew } = TabFactory.create(previewItem, false);
        tab.content = content;
        tab.item.name = `Preview: ${item.name}`;

        this.render();
        if (isNew) import('../app.js').then(m => m.App.saveSession());
        await this.activate(tab.id);
        return tab;
    },

    updatePreviewContext(tabId, newItem) {
        const tab = State.tabs.find(t => t.id === tabId);
        if (!tab) return;

        const physicalType = newItem.originalType || newItem.type;
        tab.item = {
            ...newItem,
            type: 'html-preview-file',
            originalType: physicalType,
            isPreview: true,
            name: `Preview: ${newItem.name}`
        };
        tab.uniquePath = TabPathRitual.getUniquePath(tab.item);
        this.render();
    },

    async createTemporary() {
        const tempItem = createTemporaryItem();
        const tab = await this.create(tempItem, true);
        tab.content = '';
        tab.item.content = '';
        tab.item.isVirtual = true;
        tab.item.isUnsaved = true;
        return tab;
    },

    downloadActive() {
        import('./persistence.js').then(m => m.TabsPersistence.downloadActive(this));
    },

    async reopenLastClosed() {
        const last = State.closedTabHistory.pop();
        if (last) await this.create(last.item, false, true, true);
    },

    activate: (id, force) => TabOrchestrator.activate(id, force),
    close: (id, force) => TabsLifecycle.close(id, force),
    render: () => TabsRenderer.render(document.getElementById('tab-bar'), Tabs),
    saveActive: () => TabsLifecycle.saveActive()
};
