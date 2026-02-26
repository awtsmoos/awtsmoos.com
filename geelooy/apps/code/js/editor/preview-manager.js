
// B"H
/**
 * @file preview-manager.js
 * @brief The Guardian of Background Realities.
 * 
 * THE POEM OF PERSISTENCE:
 * A world once spawned should not be cast aside,
 * When the user's eye decides to look or hide.
 * We keep the iframes breathing in the dark,
 * So state and memory hold their vital spark.
 */

import { DOM, State } from '../state.js';
import { HTMLPreviewProcessor } from '../html-preview/processor.js';

export const PreviewManager = {
    iframes: new Map(),

    show(tabId, item, content, forceReload = false) {
        // Hide all existing iframes first
        this.iframes.forEach(iframe => iframe.style.display = 'none');

        let iframe = this.iframes.get(tabId);
        let needsOrchestration = false;

        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.backgroundColor = '#fff';
            iframe.dataset.tabId = tabId;
            DOM.previewer.appendChild(iframe);
            this.iframes.set(tabId, iframe);
            needsOrchestration = true;
        }

        iframe.style.display = 'block';

        if (needsOrchestration || forceReload) {
            HTMLPreviewProcessor.orchestrate(item, iframe, content, tabId);
        }
    },

    remove(tabId) {
        const iframe = this.iframes.get(tabId);
        if (iframe) {
            iframe.remove();
            this.iframes.delete(tabId);
        }
    },
    
    getIframe(tabId) {
        return this.iframes.get(tabId);
    }
};
