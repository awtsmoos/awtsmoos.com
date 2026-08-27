
// B"H
/**
 * @file index.js
 * @brief The Universal Virtual Network.
 * 
 * THE POEM OF THE INVISIBLE THREADS:
 * We weave a web that does not touch the ground,
 * Where every simulated port is safely found.
 * If the address speaks of 'localhost' or 'home',
 * We route it to the Golem, resting in its dome.
 * If it seeks the outer world, across the silent sea,
 * We cast it to the native wind, let it fly and be.
 */

import { NodeManager } from '../node/manager.js';

export const VirtualNetwork = {
    /**
     * @async
     * @function request
     * @description unified request handler used by curl, wget, and Node.js http.get
     */
    async request(url, options = {}) {
        const isLocalhost = url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1');
        
        if (isLocalhost) {
            const urlObj = new URL(url);
            const port = urlObj.port || 80;
            
            try {
                const res = await NodeManager.routeHttpRequest(port, {
                    method: options.method || 'GET',
                    url: urlObj.pathname + urlObj.search,
                    headers: options.headers || {},
                    body: options.body
                });
                return { status: res.status, headers: res.headers, data: res.data };
            } catch (err) {
                throw new Error(`Virtual Network Error (Localhost): ${err.message}`);
            }
        } else {
            // External Request
            try {
                const res = await fetch(url, options);
                let data;
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('application/json') || contentType.includes('text/')) {
                    data = await res.text();
                } else {
                    const buf = await res.arrayBuffer();
                    data = new Uint8Array(buf);
                }
                
                const headers = {};
                res.headers.forEach((v, k) => headers[k] = v);

                return { status: res.status, headers, data };
            } catch(e) {
                throw new Error(`Virtual Network Error (External): ${e.message}`);
            }
        }
    }
};
