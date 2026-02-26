
// B"H
/**
 * @file message-bridge.js
 * @brief The Divine Messenger between the Creator (Editor) and the Creation (Preview).
 */

import { VirtualServer } from './virtual-server.js';
import { Tabs } from '../tabs/index.js';
import { State } from '../state.js';
import { PathResolver } from './resolver.js';
import { NodeSystem } from '../node/index.js'; // B"H

export const MessageBridge = {
    initialized: false,

    init() {
        if (this.initialized) return;
        window.addEventListener('message', this.handle.bind(this));
        this.initialized = true;
        console.log('[MessageBridge] B"H - Gateway established.');
    },

    async handle(e) {
        const d = e.data;
        if (!d || d.source !== 'html-preview-bridge') return;

        const { type, id, workspaceId, referrer, specifier, href, path } = d;

        try {
            // 1. FETCH & DYNAMIC IMPORTS & LOCALHOST
            if (type === 'import-request') {
                const isLocalhost = specifier.startsWith('http://localhost') || specifier.startsWith('http://127.0.0.1');
                
                if (isLocalhost) {
                    const urlObj = new URL(specifier);
                    const port = urlObj.port || 80;
                    
                    // B"H - Route to Node Simulator
                    const res = await NodeSystem.routeHttpRequest(port, { 
                        method: d.method || 'GET', 
                        url: urlObj.pathname + urlObj.search,
                        headers: d.headers || {},
                        body: d.body
                    });
                    
                    e.source.postMessage({ 
                        source: 'parent', type: 'import-response', id, 
                        content: res.data, status: res.status, mime: 'text/plain' 
                    }, '*');

                } else {
                    // Standard Physical File Read
                    const res = await VirtualServer.fetch(workspaceId, referrer, specifier);
                    e.source.postMessage({ source: 'parent', type: 'import-response', id, content: res.text, buffer: res.buffer, mime: res.mime }, '*');
                }
            } 
            // 2. LINK CLICK INTERCEPTION
            else if (type === 'open-link') {
                const absPath = PathResolver.resolve(referrer, href);
                const ws = State.workspaces.find(w => String(w.id) === String(workspaceId));
                if (ws) {
                    const item = { ...ws, path: absPath, kind: 'file', workspaceId, name: absPath.split('/').pop() };
                    Tabs.create(item);
                }
            }
            // 3. WORKER INITIALIZATION FETCH
            else if (type === 'fetch-worker-script') {
                const res = await VirtualServer.fetch(workspaceId, referrer, path);
                e.source.postMessage({ source: 'parent', type: 'worker-script-response', id, content: res.text }, '*');
            }
            // 4. WORKER IMPORTSCRIPTS FETCH (SYNC SAB)
            else if (type === 'fetch-script-content') {
                const res = await VirtualServer.fetch(workspaceId, referrer, path);
                e.source.postMessage({ source: 'parent', type: 'script-content-response', id, content: res.text, path: res.absPath }, '*');
            }
        } catch (err) {
            console.warn(`[MessageBridge] B"H - Failed request type [${type}]: ${err.message}`);
            const errType = type.replace('request', 'response').replace('fetch', 'response');
            e.source.postMessage({ source: 'parent', type: errType, id, error: err.message }, '*');
        }
    }
};
