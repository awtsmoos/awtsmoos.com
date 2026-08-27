
(function() {
    document.addEventListener('click', e => {
        const a = e.target.closest('a');
        if (a && a.href) {
            const href = a.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('data:') && !href.startsWith('blob:')) {
                e.preventDefault();
                window.parent.postMessage({ 
                    source: 'html-preview-bridge', 
                    type: 'open-link', 
                    href: href, 
                    referrer: window._AWTSMOOS_REF, 
                    workspaceId: window._AWTSMOOS_WID,
                    previewTabId: window._AWTSMOOS_TAB_ID
                }, '*');
            }
        }
    });
})();
