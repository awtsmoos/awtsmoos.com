
// B"H
/**
 * @file dom.js
 * @brief The Pulse of the Elements Inspector.
 */

export const DOMInterceptor = `
    function sendDOMUpdate() {
        if (!document.documentElement) return;
        window.parent.postMessage({
            source: 'html-preview-bridge',
            type: 'dom-update',
            previewTabId: window._AWTSMOOS_TAB_ID,
            payload: { html: document.documentElement.outerHTML }
        }, '*');
    }

    // Initial blast
    document.addEventListener('DOMContentLoaded', sendDOMUpdate);
    
    // Listen for manual requests from the DevTools panel
    window.addEventListener('message', e => {
        if (e.data && e.data.type === 'request-dom') {
            sendDOMUpdate();
        }
    });
    
    // Throttle mutations
    let domTimeout = null;
    const observer = new MutationObserver(() => {
        if (domTimeout) clearTimeout(domTimeout);
        domTimeout = setTimeout(sendDOMUpdate, 500);
    });

    observer.observe(document, { childList: true, subtree: true, attributes: true, characterData: true });
`;
