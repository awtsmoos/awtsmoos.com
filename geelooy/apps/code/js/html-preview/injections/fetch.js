
// B"H
/**
 * @file fetch.js
 * @brief The Interceptor of the Network Prayer (Fetch & XHR).
 * 
 * NOVEL OF THE VIRTUAL GATEKEEPER:
 * Every request sent by a previewed application is a prayer for data. 
 * If that prayer seeks a file within the same project, it shouldn't leave the browser's 
 * internal sanctuary to knock on the heavy doors of the real network. 
 * This module catches those prayers, resolves their relative coordinates into 
 * Absolute Truth, and petitions the Parent Window (the Editor) to provide 
 * the essence from the FileSystemProvider.
 */

export const FetchInterceptor = `
    (function() {
        /**
         * B"H - Identifies if a URL is a local project asset or a blob of light.
         */
        function isLocal(url) {
            if (!url) return false;
            const s = String(url);
            // Blobs are already manifested in memory
            if (s.startsWith('blob:') || s.startsWith('data:')) return false;
            // Absolute web paths are external
            if (s.startsWith('http://') || s.startsWith('https://')) {
                // EXCEPT if it's pointing to our own internal localhost port
                // which often happens during automated testing.
                return s.includes(window.location.host) && !s.includes('UUID'); 
            }
            // Relative paths are always local
            return true;
        }

        function logNetwork(method, url, status, type, duration) {
            window.parent.postMessage({
                source: 'html-preview-bridge',
                type: 'network-log',
                previewTabId: window._AWTSMOOS_TAB_ID,
                payload: { 
                    method: method || 'GET', 
                    url: String(url), 
                    status: status, 
                    type: type, 
                    duration: duration, 
                    time: Date.now() 
                }
            }, '*');
        }

        /**
         * B"H - Reaches into the Editor's memory to find a file.
         */
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

        // B"H - Overriding the standard Fetch API
        const origFetch = window.fetch;
        window.fetch = async function(input, init) {
            const url = typeof input === 'string' ? input : (input && input.url ? input.url : String(input));
            const method = (init && init.method) || (input && input.method) || 'GET';
            const startTime = performance.now();
            
            if (isLocal(url)) {
                try {
                    // Resolve the relative path into an Absolute Coordinate
                    const absPath = window._resolvePath ? window._resolvePath(url) : url;
                    const reqData = init ? { 
                        method: init.method || 'GET', 
                        headers: init.headers, 
                        body: init.body 
                    } : { method: 'GET' };
                    
                    const data = await fetchFromParent(absPath, reqData);
                    
                    const responseBody = data.buffer || data.content;
                    const responseOpts = { 
                        status: data.status || 200, 
                        headers: { 'Content-Type': data.mime || 'text/plain' } 
                    };
                    
                    logNetwork(method, url, data.status || 200, 'virtual', performance.now() - startTime);
                    return new Response(responseBody, responseOpts);
                } catch(e) {
                    logNetwork(method, url, 404, 'virtual-error', performance.now() - startTime);
                    return new Response(null, { status: 404, statusText: e.message });
                }
            }
            
            // Allow external requests to pass through to the real world
            try {
                const res = await origFetch(input, init);
                logNetwork(method, url, res.status, 'external', performance.now() - startTime);
                return res;
            } catch (e) {
                logNetwork(method, url, 0, 'failed', performance.now() - startTime);
                throw e;
            }
        };

        // B"H - Overriding XMLHttpRequest for legacy compatibility
        const OrigXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new OrigXHR();
            const origOpen = xhr.open;
            xhr.open = function(method, url, ...args) {
                this._url = url;
                this._method = method;
                return origOpen.apply(this, [method, url, ...args]);
            };
            return xhr;
        };
    })();
`;
