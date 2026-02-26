
// B"H
/**
 * @file click.js
 * @brief The Interceptor of the Hyperlink.
 * 
 * THE POEM OF THE PATH:
 * A click is a desire to travel the void,
 * To leave the current vessel and be redeployed.
 * We catch this desire before it takes flight,
 * And route it to the Editor to manifest the light.
 */

export const ClickInterceptor = `
    document.addEventListener('click', e => {
        const a = e.target.closest('a');
        if (a && a.href) {
            const href = a.getAttribute('href');
            if (!href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('data:') && !href.startsWith('blob:')) {
                e.preventDefault();
                window.parent.postMessage({ 
                    source: 'html-preview-bridge', 
                    type: 'open-link', 
                    href, 
                    referrer: window._AWTSMOOS_REF, 
                    workspaceId: window._AWTSMOOS_WID 
                }, '*');
            }
        }
    });
`;
