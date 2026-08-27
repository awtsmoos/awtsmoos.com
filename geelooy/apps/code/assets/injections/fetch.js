
(function() {
    function isLocal(url) {
        if (!url) return false;
        const s = String(url);
        if (s.startsWith('blob:') || s.startsWith('data:')) return false;
        if (s.startsWith('http://') || s.startsWith('https://')) {
            return s.includes(window.location.host) && !s.includes('UUID'); 
        }
        return true;
    }

    function logNetwork(method, url, status, type, duration) {
        window.parent.postMessage({
            source: 'html-preview-bridge',
            type: 'network-log',
            previewTabId: window._AWTSMOOS_TAB_ID,
            payload: { 
                method: method || 'GET', url: String(url), 
                status: status, type: type, duration: duration, 
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
                id: id,
                ...reqData 
            }, '*');
        });
    }

    const origFetch = window.fetch;
    window.fetch = async function(input, init) {
        const url = typeof input === 'string' ? input : (input && input.url ? input.url : String(input));
        const method = (init && init.method) || (input && input.method) || 'GET';
        const startTime = performance.now();
        
        if (isLocal(url)) {
            try {
                const absPath = window._resolvePath ? window._resolvePath(url) : url;
                const reqData = init ? { 
                    method: init.method || 'GET', headers: init.headers, body: init.body 
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
        try {
            const res = await origFetch(input, init);
            logNetwork(method, url, res.status, 'external', performance.now() - startTime);
            return res;
        } catch (e) {
            logNetwork(method, url, 0, 'failed', performance.now() - startTime);
            throw e;
        }
    };
})();
