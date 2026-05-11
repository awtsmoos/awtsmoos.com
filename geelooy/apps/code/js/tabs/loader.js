
// B"H
/**
 * @file loader.js
 * @brief The Alchemist of File Essence.
 * 
 * THE HYMN OF THE SECURE MANIFESTATION:
 * When a DevTools vessel is opened, it is blind without its Source. 
 * We ensure that when the user switches to or refreshes on a Console, 
 * the corresponding Preview iframe is drawn into the DOM, keeping the 
 * dimensional link unbroken.
 */

import { UI } from '../ui.js';
import { FileSystemProvider } from '../fs-provider.js';
import { EditorCore } from '../editor/core.js';
import { PreviewManager } from '../editor/preview-manager.js';
import { ZipExplorer } from '../zip/zip-explorer.js';

export const TabsLoader = {
    /**
     * @async
     * @function loadTabContent
     * @description Ensures the tab's internal soul (content) is populated.
     */
    async loadTabContent(tab) {
        if (!tab || !tab.item) return false;

        const contentInMind = (tab.content !== undefined && tab.content !== null && tab.content !== "");
        if (contentInMind && !tab.forceReload) {
            return true;
        }

        const species = tab.item.type || tab.fileType;
        const virtualSpecies = ['devtools', 'browser', 'vibe-manager', 'vibe-session'];
        if (virtualSpecies.includes(species)) {
            return true; 
        }

        try {
            UI.showLoading("B\"H - Reaching for the essence of " + tab.item.name + "...");
            
            const isPreviewFile = (tab.item.type === 'html-preview-file' || tab.isPreview);
            const lookupType = isPreviewFile ? (tab.item.originalType || 'local') : tab.item.type;
            
            const coordinate = { 
                ...tab.item, 
                type: lookupType,
                workspaceId: tab.item.workspaceId || tab.item.id 
            };

            const rawEssence = await FileSystemProvider.read(coordinate);
            if (rawEssence === undefined || rawEssence === null) throw new Error("The physical vessel yielded no light.");

            let text = "";
            if (typeof rawEssence === 'string') text = rawEssence;
            else if (rawEssence instanceof Blob) text = await rawEssence.text();
            else if (rawEssence.base64Content) text = atob(rawEssence.base64Content);
            else text = String(rawEssence);

            tab.content = text;
            return true;

        } catch (shevirah) {
            console.error("B\"H [TabsLoader] The descent of " + tab.item.name + " was blocked:", shevirah);
            const isLocked = shevirah.message.includes("sealed") || shevirah.name === "LockedAccessError";
            if (!isLocked) UI.showToast("Error reading " + tab.item.name + ": " + shevirah.message, "error");
            return false;
        } finally {
            UI.hideLoading();
        }
    },

    /**
     * @async
     * @function renderTabView
     * @description Directs the manifested content into the appropriate physical panel.
     */
    async renderTabView(tab, forceReload) {
        const type = tab.item.type || tab.fileType;
        const isActive = (import('../state.js').then(s => s.State.activeTabId === tab.id));

        if (tab.fileType === 'zip') {
            await ZipExplorer.open(tab.rawContent, tab);
        } else if (tab.isPreview || type === 'html-preview-file') {
            // THE PREVIEW RITUAL: Keep it hidden unless active
            PreviewManager.show(tab.id, tab.item, tab.content, forceReload);
            
            const frame = PreviewManager.getIframe(tab.id);
            if (frame) {
                // Determine if it should be visible based on active tab
                import('../state.js').then(s => {
                    const isVisible = s.State.activeTabId === tab.id;
                    frame.style.display = isVisible ? 'block' : 'none';
                    frame.style.visibility = isVisible ? 'visible' : 'hidden';
                    
                    // IF we are a console tab, we don't hide our parent PREVIEW
                    const activeT = s.State.tabs.find(t => t.id === s.State.activeTabId);
                    if (activeT && activeT.fileType === 'devtools' && String(activeT.item.previewTabId) === String(tab.id)) {
                         frame.style.display = 'none'; // Keep it hidden from eye but in DOM
                    }
                });
            }
        } else if (type === 'browser') {
            const { BrowserManager } = await import('../browser/index.js');
            BrowserManager.render(tab);
        } else if (type === 'devtools') {
            // B"H - PREVIEW SYNC: Ensure its source preview is in the DOM
            this._awakenPreviewSource(tab.item.previewTabId);
            
            const target = document.getElementById('devtools-wrapper');
            if (target) {
                // Delegate completely to the DevTools class! No manual UI rendering here!
                const { DevTools } = await import('../devtools/index.js');
                new DevTools(target, tab);
            }
        } else {
            await EditorCore.showTextEditor(tab.content || "", tab.item.name, tab.scrollPos || 0);
        }
    },

    /**
     * @private
     * B"H - Ensures a preview exists in the background for its linked console.
     */
    _awakenPreviewSource(previewId) {
        if (!previewId) return;
        import('../state.js').then(s => {
            const pTab = s.State.tabs.find(t => String(t.id) === String(previewId));
            if (pTab) {
                this.loadTabContent(pTab).then(ok => {
                    if (ok) this.renderTabView(pTab, false);
                });
            }
        });
    }
};
