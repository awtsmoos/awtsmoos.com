
// B"H
/**
 * @file preview-manager.js
 * @brief THE REGISTRY OF OMNIPRESENCE.
 * 
 * THE HYMN OF THE SECURED PORTAL:
 * A portal may exist in the earth of the DOM,
 * While its name is forgotten in the Registry's home.
 * We perform the scan, we check every part,
 * To find the true vessel and follow the heart.
 * From ID to attribute, the search is made clear,
 * Bringing the distant connection quite near!
 */

import { DOM } from '../state.js';
import { HTMLPreviewProcessor } from '../html-preview/processor.js';

/**
 * @class PreviewManager
 * @description Oversees the physical manifestation and retrieval of all sandbox iframes.
 */
export const PreviewManager = {
    /** @private @type {Map<string, HTMLIFrameElement>} _visions */
    _visions: new Map(), 

    /**
     * B"H - Solidifies a preview vision in the UI.
     * @param {string|number} tabId - Unique vision identity.
     * @param {Object} item - Data coordinate.
     * @param {string} content - Raw HTML light.
     * @param {boolean} [forceReload=false] - Force re-manifestation.
     */
    show(tabId, item, content, forceReload = false) {
        const id = String(tabId);
        console.log(`[PreviewManager] B"H - Requesting sight for Vision [${id}]`);
        
        this.hideAll();

        let iframe = this.getIframe(id);
        let needsOrchestration = false;

        if (!iframe) {
            console.log(`[PreviewManager] B"H - Constructing new Portal for [${id}]`);
            iframe = document.createElement('iframe');
            iframe.className = 'browser-iframe';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.background = '#fff';
            
            // B"H - Anchoring identity to the physical attributes
            iframe.setAttribute('data-tab-id', id);
            iframe.dataset.tabId = id;
            
            DOM.previewer.appendChild(iframe);
            this.registerIframe(id, iframe);
            needsOrchestration = true;
        }

        iframe.style.display = 'block';

        if (needsOrchestration || forceReload) {
            HTMLPreviewProcessor.orchestrate(item, iframe, content, id);
        }
    },

    /**
     * B"H - Records a physical portal in the sacred registry.
     */
    registerIframe(tabId, iframe) {
        const id = String(tabId);
        this._visions.set(id, iframe);
        console.log(`[PreviewManager] B"H - Vision [${id}] inscribed in Registry.`);
    },

    /**
     * B"H - The Ritual of the Absolute Search.
     * Peers directly into the DOM if the Registry fails to answer.
     * @param {string|number} tabId 
     * @returns {HTMLIFrameElement|null}
     */
    getIframe(tabId) {
        const id = String(tabId);
        
        // 1. Check the spiritual Registry
        let frame = this._visions.get(id);
        
        // 2. Physical DOM Search (The Hand of Asiyah)
        if (!frame) {
            console.warn(`[PreviewManager] B"H - [${id}] missing from registry. Searching DOM directly...`);
            frame = document.querySelector(`iframe[data-tab-id="${id}"]`);
            if (frame) {
                this.registerIframe(id, frame); // Re-inscribe for future speed
            }
        }
        
        return frame;
    },

    /**
     * Hides all visual portals to clear the user's mind.
     */
    hideAll() {
        // Direct query to ensure every visible frame is caught
        const allPortals = document.querySelectorAll('iframe.browser-iframe');
        allPortals.forEach(f => f.style.display = 'none');
    },

    /**
     * Dissolves a portal from existence.
     */
    remove(tabId) {
        const id = String(tabId);
        const frame = this.getIframe(id);
        if (frame) {
            if (frame.parentNode) frame.parentNode.removeChild(frame);
            this._visions.delete(id);
        }
    }
};
