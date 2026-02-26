
// B"H
/**
 * @file fetch.js
 * @brief The Interceptor of the Network Prayer (Fetch & XHR).
 */

export const FetchInterceptor = `
    (function() {
        function logNetwork(method, url, status, type, duration) {
            window.parent.postMessage({
                source: 'html-preview-bridge',
                type: 'network-log',
                previewTabId: window._AWTSMOOS_TAB_ID,
                payload: { 
                    method: method || 'GET', 
                    url: url, 
                    status: status, 
                    type: type, 
                    duration: duration, 
                    time: Date.now() 
                }
            }, '*');
        }

        function fetchFromParent(path, reqData = {}) {
            return new Promise((resolve, reject) => {
                const id = Math.random().toString(36).slice(2);
                const handler = (e) => {
                    if (e.data && e.data.type === 'import-response' && e.data.id === id) {
                        window.removeEventListener('message', handler);
                        if (e.data.error) reject(new Error(e.data.error));
                        else resolve(e.data);
                    }
                };
                window.addEventListener('message', handler);
                window.parent.postMessage({ 
                    source: 'html-preview-bridge', 
                    type: 'import-request', 
                    specifier: path, 
                    referrer: window._AWTSMOOS_REF, 
                    workspaceId: window._AWTSMOOS_WID, 
                    id,
                    ...reqData 
                }, '*');
            });
        }

        const origFetch = window.fetch;
        window.fetch = async function(input, init) {
            const url = typeof input === 'string' ? input : (input && input.url ? input.url : String(input));
            const method = (init && init.method) || (input && input.method) || 'GET';
            const startTime = performance.now();
            
            const isLocalhost = url && (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1'));
            const isLocalAsset = url && !url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('blob:');

            if (isLocalhost || isLocalAsset) {
                try {
                    const reqData = init ? { method: init.method || 'GET', headers: init.headers, body: init.body } : { method: 'GET' };
                    const data = await fetchFromParent(url, reqData);
                    
                    const responseBody = data.buffer || data.content;
                    const responseOpts = { 
                        status: data.status || 200, 
                        headers: { 'Content-Type': data.mime || 'text/plain' } 
                    };
                    
                    const duration = performance.now() - startTime;
                    logNetwork(method, url, data.status || 200, 'virtual', duration);
                    
                    return new Response(responseBody, responseOpts);
                } catch(e) {
                    const duration = performance.now() - startTime;
                    logNetwork(method, url, 404, 'virtual-error', duration);
                    return new Response(null, { status: 404, statusText: e.message });
                }
            }
            
            try {
                const res = await origFetch(input, init);
                const duration = performance.now() - startTime;
                logNetwork(method, url, res.status, 'external', duration);
                return res;
            } catch (e) {
                const duration = performance.now() - startTime;
                logNetwork(method, url, 0, 'failed', duration);
                throw e;
            }
        };
    })();
`;
