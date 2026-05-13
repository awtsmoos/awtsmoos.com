
// B"H
/**
 * @file loader.js
 * @brief The Alchemist of Tab Essence.
 *
 * @description
 * The Awtsmoos creates every vessel with its own path of revelation:
 * real files descend through FileSystemProvider.read, while living tools
 * like Terminal, Commander, DevTools, Browser, Vibe, and Virtual OS are
 * already alive and must never be forced through the file-reading gate.
 */

import { DOM } from '../state.js';
import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { EditorCore } from '../editor/core.js';
import { PreviewManager } from '../editor/preview-manager.js';
import { ZipExplorer } from '../zip/zip-explorer.js';

const VIRTUAL_SPECIES = new Set([
    'devtools',
    'browser',
    'vibe-manager',
    'vibe-session',
    'virtual-os',
    'terminal',
    'commander'
]);

export const TabsLoader = {
    /**
     * @async
     * @function loadTabContent
     * @param {object} tab The tab vessel being activated.
     * @returns {Promise<boolean>} True when the tab may be rendered.
     */
    async loadTabContent(tab) {
        if (!tab || !tab.item) return false;

        const contentInMind = (
            tab.content !== undefined &&
            tab.content !== null &&
            tab.content !== ''
        );

        if (contentInMind && !tab.forceReload) return true;

        const species = tab.item.type || tab.fileType;

        if (VIRTUAL_SPECIES.has(species)) return true;

        try {
            UI.showLoading('B"H - Reaching for the essence of ' + tab.item.name + '...');

            const isPreviewFile = tab.item.type === 'html-preview-file' || tab.isPreview;
            const lookupType = isPreviewFile ? (tab.item.originalType || 'local') : tab.item.type;
            const coordinate = {
                ...tab.item,
                type: lookupType,
                workspaceId: tab.item.workspaceId || tab.item.id
            };

            const rawEssence = await FileSystemProvider.read(coordinate);
            if (rawEssence === undefined || rawEssence === null) {
                throw new Error('The physical vessel yielded no light.');
            }

            let text = '';
            if (typeof rawEssence === 'string') text = rawEssence;
            else if (rawEssence instanceof Blob) text = await rawEssence.text();
            else if (rawEssence.base64Content) text = atob(rawEssence.base64Content);
            else text = String(rawEssence);

            tab.content = text;
            return true;
        } catch (shevirah) {
            console.error('B"H [TabsLoader] The descent of ' + tab.item.name + ' was blocked:', shevirah);

            const isLocked =
                shevirah.message?.includes('sealed') ||
                shevirah.name === 'LockedAccessError';

            if (!isLocked) {
                UI.showToast('Error reading ' + tab.item.name + ': ' + shevirah.message, 'error');
            }

            return false;
        } finally {
            UI.hideLoading();
        }
    },

    /**
     * @async
     * @function renderTabView
     * @param {object} tab The active tab.
     * @param {boolean} forceReload Whether preview-style renderers must refresh.
     * @returns {Promise<void>}
     */
    async renderTabView(tab, forceReload) {
        const type = tab.item.type || tab.fileType;

        if (tab.fileType === 'zip') {
            await ZipExplorer.open(tab.rawContent, tab);
            return;
        }

        if (tab.isPreview || type === 'html-preview-file') {
            PreviewManager.show(tab.id, tab.item, tab.content, forceReload);
            const frame = PreviewManager.getIframe(tab.id);

            if (frame) {
                import('../state.js').then((s) => {
                    const isVisible = s.State.activeTabId === tab.id;
                    frame.style.display = isVisible ? 'block' : 'none';
                    frame.style.visibility = isVisible ? 'visible' : 'hidden';

                    const activeT = s.State.tabs.find((t) => t.id === s.State.activeTabId);
                    if (activeT && activeT.fileType === 'devtools' && String(activeT.item.previewTabId) === String(tab.id)) {
                        frame.style.display = 'none';
                    }
                });
            }
            return;
        }

        if (type === 'terminal') {
            const { Terminal } = await import('../terminal/index.js');
            if (DOM.terminalWrapper) Terminal.render(tab, DOM.terminalWrapper);
            return;
        }

        if (type === 'commander') {
            const { FileCommander } = await import('../file-commander/index.js');
            if (DOM.fileCommanderWrapper) FileCommander.render(tab, DOM.fileCommanderWrapper);
            return;
        }

        if (type === 'browser') {
            const { BrowserManager } = await import('../browser/index.js');
            BrowserManager.render(tab);
            return;
        }

        if (type === 'virtual-os') {
            const { VirtualOSManager } = await import('../virtual-os/index.js');
            await VirtualOSManager.render(tab);
            return;
        }

        if (type === 'devtools') {
            this._awakenPreviewSource(tab.item.previewTabId);

            const target = document.getElementById('devtools-wrapper');
            if (target) {
                const { DevTools } = await import('../devtools/index.js');
                new DevTools(target, tab);
            }
            return;
        }

        await EditorCore.showTextEditor(tab.content || '', tab.item.name, tab.scrollPos || 0);
    },

    /**
     * @private
     * @function _awakenPreviewSource
     * @param {number|string} previewId The preview tab id linked to a devtools tab.
     * @returns {void}
     */
    _awakenPreviewSource(previewId) {
        if (!previewId) return;

        import('../state.js').then((s) => {
            const pTab = s.State.tabs.find((t) => String(t.id) === String(previewId));
            if (pTab) {
                this.loadTabContent(pTab).then((ok) => {
                    if (ok) this.renderTabView(pTab, false);
                });
            }
        });
    }
};
