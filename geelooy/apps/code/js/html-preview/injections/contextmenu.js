
// B"H
/**
 * @file contextmenu.js
 * @brief The Interceptor of the Right-Click.
 */

export const ContextMenuInterceptor = `
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        
        // 1. Detect if hovering over a local link
        const a = e.target.closest('a');
        let href = null;
        if (a && a.href) {
            const h = a.getAttribute('href');
            if (!h.startsWith('http') && !h.startsWith('#') && !h.startsWith('mailto:') && !h.startsWith('data:') && !h.startsWith('blob:')) {
                href = h;
            }
        }
        
        // 2. Detect if text is highlighted
        const selectionText = window.getSelection().toString();

        // 3. Transmit the state to the Heavens (Parent window)
        window.parent.postMessage({
            source: 'html-preview-bridge',
            type: 'context-menu',
            x: e.clientX,
            y: e.clientY,
            href: href,
            hasSelection: selectionText.length > 0,
            selectionText: selectionText,
            referrer: window._AWTSMOOS_REF,
            workspaceId: window._AWTSMOOS_WID,
            previewTabId: window._AWTSMOOS_TAB_ID
        }, '*');
    });

    // B"H - Listen for physical commands from the parent (e.g. Select All)
    window.addEventListener('message', e => {
        if (e.data && e.data.type === 'iframe-exec-cmd') {
            if (e.data.cmd === 'selectAll') {
                const range = document.createRange();
                range.selectNodeContents(document.body);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else {
                document.execCommand(e.data.cmd);
            }
        }
    });
`;
