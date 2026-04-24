
// B"H
/**
 * @file dom.js
 * @brief The Pulse of the Elements Inspector.
 * 
 * B"H - Rectified with a holy pause (debounce). The DOM mutates endlessly,
 * but we only notify the heavens when the dust settles, preserving harmony.
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
    
    // Throttle mutations to prevent infinite loops and performance death
    let domTimeout = null;
    const observer = new MutationObserver(() => {
        if (domTimeout) clearTimeout(domTimeout);
        domTimeout = setTimeout(sendDOMUpdate, 1000); // B"H - A generous 1 second pause
    });

    observer.observe(document, { childList: true, subtree: true, attributes: true, characterData: true });
`;
