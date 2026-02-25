// B"H
// FILE: js/html-preview-templates.js

export const getNetworkInterceptorScript = (workspaceId, referrerPath) => /*js*/`
    (function() {
        console.log('B"H - Network Interceptor Active');
        
        function reportError(type, msg, source, line, col) {
            if (window.parent) {
                window.parent.postMessage({
                    source: 'html-preview-console',
                    type: 'log',
                    payload: { 
                        level: 'error', 
                        args: [{
                            type: 'error', 
                            message: msg || 'Unknown Error',
                            stack: source ? (source + ':' + line + ':' + col) : 'No stack trace'
                        }] 
                    }
                }, '*');
            }
        }

        window.onerror = function(message, source, lineno, colno, error) {
            reportError('Runtime Error', message, source, lineno, colno);
            return false; 
        };

        window.addEventListener('unhandledrejection', function(event) {
            reportError('Promise Rejection', event.reason ? event.reason.message : 'Unknown Reason');
        });

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

        window._resolvePath = resolvePath; 

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
                if (window.parent) {
                    window.parent.postMessage({
                        source: 'html-preview-bridge',
                        type: 'import-request',
                        specifier: path,
                        referrer: REFERRER,
                        workspaceId: WORKSPACE_ID,
                        id: id
                    }, '*');
                } else {
                    reject(new Error("Detached iframe: cannot fetch resources."));
                }
            });
        }
        window._fetchFromParent = fetchFromParent; 

        const originalFetch = window.fetch;
        window.fetch = async function(input, init) {
            const url = typeof input === 'string' ? input : input.url;
            const absPath = resolvePath(url);
            if (absPath) {
                try {
                    const content = await fetchFromParent(absPath);
                    let type = 'text/plain';
                    if (absPath.endsWith('.json')) type = 'application/json';
                    if (absPath.endsWith('.png')) type = 'image/png';
                    if (absPath.endsWith('.js')) type = 'application/javascript';
                    if (absPath.endsWith('.html')) type = 'text/html';
                    return new Response(content, { status: 200, headers: { 'Content-Type': type } });
                } catch(e) {
                    console.warn("Fetch failed for", url, e);
                    return new Response(null, { status: 404, statusText: e.message });
                }
            }
            return originalFetch(input, init);
        };
    })();
`;