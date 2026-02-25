
// B"H
// FILE: js/html-preview/html-preview-templates.js

/**
 * B"H - The Network Interceptor Script.
 * This script is injected into the preview iframe to allow it to communicate 
 * with the parent editor and fetch local files via the FileSystemProvider.
 */
export const getNetworkInterceptorScript = (workspaceId, referrerPath) => /*js*/`
    (function() {
        console.log('B"H - Network Interceptor Ignited for Preview');
        
        const WORKSPACE_ID = ${JSON.stringify(workspaceId)};
        const REFERRER = ${JSON.stringify(referrerPath)};
        
        function resolvePath(relPath) {
            if (!relPath || relPath.startsWith('http') || relPath.startsWith('data:') || relPath.startsWith('blob:')) return null;
            if (relPath.startsWith('/')) return relPath;
            const basePath = REFERRER.substring(0, REFERRER.lastIndexOf('/'));
            const stack = basePath ? basePath.split('/').filter(p => p) : [];
            const parts = relPath.split('/');
            for (const p of parts) {
                if (p === '..') stack.pop();
                else if (p !== '.') stack.push(p);
            }
            return '/' + stack.join('/');
        }

        function fetchFromParent(path) {
            return new Promise((resolve, reject) => {
                const id = Math.random().toString(36).slice(2);
                const handler = (e) => {
                    if (e.data.type === 'import-response' && e.data.id === id) {
                        window.removeEventListener('message', handler);
                        if (e.data.error) reject(new Error(e.data.error));
                        else resolve(e.data.content);
                    }
                };
                window.addEventListener('message', handler);
                window.parent.postMessage({
                    source: 'html-preview-bridge',
                    type: 'import-request',
                    specifier: path,
                    referrer: REFERRER,
                    workspaceId: WORKSPACE_ID,
                    id: id
                }, '*');
            });
        }

        const originalFetch = window.fetch;
        window.fetch = async function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            const absPath = resolvePath(url);
            if (absPath) {
                console.log('[NetworkInterceptor] Intercepting fetch for:', absPath);
                try {
                    const content = await fetchFromParent(absPath);
                    let type = 'text/plain';
                    if (absPath.endsWith('.json')) type = 'application/json';
                    else if (absPath.endsWith('.js')) type = 'application/javascript';
                    else if (absPath.endsWith('.html')) type = 'text/html';
                    return new Response(content, { status: 200, headers: { 'Content-Type': type } });
                } catch(e) {
                    return new Response(null, { status: 404, statusText: e.message });
                }
            }
            return originalFetch(input, init);
        };
    })();
`;
