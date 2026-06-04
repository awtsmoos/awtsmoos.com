// B"H
/**
 * @file loader.js
 * @brief The Alchemist of Tab Essence.
 * @description
 * B"H. Real files descend through FileSystemProvider.read. Virtual tools and
 * newborn temp scrolls already breathe in memory; the Awtsmoos gives them a
 * blank page before the disk is asked to testify.
 */

import { DOM } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { EditorCore } from '../editor/core.js';
import { PreviewManager } from '../editor/preview-manager.js';
import { ZipExplorer } from '../zip/zip-explorer.js';

const VIRTUAL_SPECIES = new Set([
    'devtools', 'browser', 'vibe-manager', 'vibe-session',
    'virtual-os', 'terminal', 'commander', 'temp'
]);

/**
 * B"H. Blank temp content is still content: a revealed white fire scroll.
 * @param {object} tab Tab vessel.
 * @returns {boolean} Whether the tab already carries content.
 */
function hasContentInMind(tab) {
    if (!tab) return false;
    if (tab.item?.type === 'temp') return tab.content !== undefined && tab.content !== null;
    return tab.content !== undefined && tab.content !== null && tab.content !== '';
}

/**
 * B"H. Reads a tab's routing species.
 * @param {object} tab Tab vessel.
 * @returns {string} Resolved type.
 */
function getTabSpecies(tab) {
    return tab?.item?.type || tab?.fileType || '';
}

/**
 * B"H. Makes memory-only tabs safe to render without filesystem descent.
 * @param {object} tab Virtual tab vessel.
 * @returns {boolean} Always true after content is stabilized.
 */
function awakenVirtualContent(tab) {
    if (tab.content === undefined || tab.content === null) tab.content = tab.item?.content || '';
    if (tab.item && (tab.item.content === undefined || tab.item.content === null)) tab.item.content = tab.content;
    return true;
}

/**
 * B"H. Converts provider responses into editor text.
 * @param {any} rawEssence Provider response.
 * @returns {Promise<string>} Textual content.
 */
async function stringifyEssence(rawEssence) {
    if (typeof rawEssence === 'string') return rawEssence;
    if (rawEssence instanceof Blob) return await rawEssence.text();
    if (rawEssence.base64Content) return atob(rawEssence.base64Content);
    return String(rawEssence);
}

export const TabsLoader = {
    async loadTabContent(tab) {
        if (!tab || !tab.item) return false;
        if (hasContentInMind(tab) && !tab.forceReload) return true;

        const species = getTabSpecies(tab);
        if (VIRTUAL_SPECIES.has(species) || tab.item.isVirtual === true) return awakenVirtualContent(tab);

        try {
            UI.showLoading('B"H - Reaching for the essence of ' + tab.item.name + '...');
            const isPreviewFile = tab.item.type === 'html-preview-file' || tab.isPreview;
            const coordinate = {
                ...tab.item,
                type: isPreviewFile ? (tab.item.originalType || 'local') : tab.item.type,
                workspaceId: tab.item.workspaceId || tab.item.id
            };
            const rawEssence = await FileSystemProvider.read(coordinate);
            if (rawEssence === undefined || rawEssence === null) throw new Error('The physical vessel yielded no light.');
            tab.content = await stringifyEssence(rawEssence);
            return true;
        } catch (shevirah) {
            console.error('B"H [TabsLoader] The descent of ' + tab.item.name + ' was blocked:', shevirah);
            const isLocked = shevirah.message?.includes('sealed') || shevirah.name === 'LockedAccessError';
            if (!isLocked) UI.showToast('Error reading ' + tab.item.name + ': ' + shevirah.message, 'error');
            return false;
        } finally {
            UI.hideLoading();
        }
    },

    async renderTabView(tab, forceReload) {
        const type = getTabSpecies(tab);
        if (tab.fileType === 'zip') return await ZipExplorer.open(tab.rawContent, tab);
        if (tab.isPreview || type === 'html-preview-file') return this._renderPreview(tab, forceReload);

        const renderers = {
            terminal: async () => (await import('../terminal/index.js')).Terminal.render(tab, DOM.terminalWrapper),
            commander: async () => (await import('../file-commander/index.js')).FileCommander.render(tab, DOM.fileCommanderWrapper),
            browser: async () => (await import('../browser/index.js')).BrowserManager.render(tab),
            'virtual-os': async () => (await import('../virtual-os/index.js')).VirtualOSManager.render(tab),
            devtools: async () => this._renderDevTools(tab)
        };

        if (renderers[type]) return await renderers[type]();
        await EditorCore.showTextEditor(tab.content || '', tab.item.name, tab.scrollPos || 0);
    },

    _renderPreview(tab, forceReload) {
        PreviewManager.show(tab.id, tab.item, tab.content, forceReload);
        const frame = PreviewManager.getIframe(tab.id);
        if (!frame) return;
        import('../state.js').then((s) => {
            const isVisible = s.State.activeTabId === tab.id;
            frame.style.display = isVisible ? 'block' : 'none';
            frame.style.visibility = isVisible ? 'visible' : 'hidden';
            const activeT = s.State.tabs.find((t) => t.id === s.State.activeTabId);
            if (activeT?.fileType === 'devtools' && String(activeT.item.previewTabId) === String(tab.id)) frame.style.display = 'none';
        });
    },

    async _renderDevTools(tab) {
        this._awakenPreviewSource(tab.item.previewTabId);
        const target = document.getElementById('devtools-wrapper');
        if (!target) return;
        const { DevTools } = await import('../devtools/index.js');
        new DevTools(target, tab);
    },

    _awakenPreviewSource(previewId) {
        if (!previewId) return;
        import('../state.js').then((s) => {
            const pTab = s.State.tabs.find((t) => String(t.id) === String(previewId));
            if (!pTab) return;
            this.loadTabContent(pTab).then((ok) => ok && this.renderTabView(pTab, false));
        });
    }
};
