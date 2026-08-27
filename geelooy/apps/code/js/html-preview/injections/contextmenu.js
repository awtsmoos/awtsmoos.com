
// B"H
/**
 * @file contextmenu.js
 * @brief The Interceptor of the Right-Click with Precise Node Path.
 */

export const ContextMenuInterceptor = `
    (function() {
        function getElementPath(el) {
            const path = [];
            while (el && el !== document.documentElement) {
                const parent = el.parentNode;
                if (!parent) break;
                
                // B"H - Use childNodes to match the Tree Builder's logic (which counts text nodes)
                const index = Array.prototype.indexOf.call(parent.childNodes, el);
                path.unshift(index);
                el = parent;
            }
            return path;
        }

        document.addEventListener('contextmenu', e => {
            e.preventDefault();
            
            let target = e.target;
            // If user clicked a text node, inspect its container element
            if (target.nodeType === 3) target = target.parentElement; // Node.TEXT_NODE
            
            const path = getElementPath(target);
            console.log('B"H - Inspect Path Calculated:', path);

            const a = target.closest('a');
            let href = null;
            if (a && a.href) {
                const h = a.getAttribute('href');
                if (!h.startsWith('http') && !h.startsWith('#') && !h.startsWith('mailto:') && !h.startsWith('data:') && !h.startsWith('blob:')) {
                    href = h;
                }
            }
            
            const selectionText = window.getSelection().toString();

            window.parent.postMessage({
                source: 'html-preview-bridge',
                type: 'context-menu',
                x: e.clientX,
                y: e.clientY,
                href: href,
                hasSelection: selectionText.length > 0,
                selectionText: selectionText,
                targetPath: path, 
                referrer: window._AWTSMOOS_REF,
                workspaceId: window._AWTSMOOS_WID,
                previewTabId: window._AWTSMOOS_TAB_ID
            }, '*');
        });

        window.addEventListener('message', e => {
            const d = e.data;
            if (!d) return;

            if (d.type === 'iframe-exec-cmd') {
                if (d.cmd === 'selectAll') {
                    const range = document.createRange();
                    range.selectNodeContents(document.body);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                } else {
                    document.execCommand(d.cmd);
                }
            } else if (d.type === 'update-element-html') {
                // Traverse path to find element
                const el = d.path.reduce((curr, idx) => (curr && curr.childNodes ? curr.childNodes[idx] : null), document.documentElement);
                if (el && el.nodeType === 1) el.outerHTML = d.html;
            }
        });
    })();
`;
