
// B"H
// FILE: js/html-preview/message-bridge.js

import { VirtualServer } from './virtual-server.js';
import { Tabs } from '../tabs/index.js';
import { State } from '../state.js';
import { PathResolver } from './resolver.js';
import { VirtualNetwork } from '../network/index.js'; 
import { NodeSystem } from '../node/index.js';

export const MessageBridge = {
    initialized: false,
    init() {
        if (this.initialized) return;
        window.addEventListener('message', this.handle.bind(this));
        this.initialized = true;
    },

    async handle(e) {
        const d = e.data;
        if (!d || d.source !== 'html-preview-bridge') return;

        const { type, id, workspaceId, referrer, specifier, href, path, url, data } = d;

        try {
            if (type === 'import-request') {
                const isLocalhost = specifier.startsWith('http://localhost') || specifier.startsWith('http://127.0.0.1');
                if (isLocalhost) {
                    // Route entirely through the Virtual Network
                    const res = await VirtualNetwork.request(specifier, { 
                        method: d.method || 'GET', headers: d.headers || {}, body: d.body
                    });
                    e.source.postMessage({ source: 'parent', type: 'import-response', id, content: res.data, status: res.status, mime: 'text/plain' }, '*');
                } else {
                    const res = await VirtualServer.fetch(workspaceId, referrer, specifier);
                    e.source.postMessage({ source: 'parent', type: 'import-response', id, content: res.text, buffer: res.buffer, mime: res.mime }, '*');
                }
            } 
            else if (type === 'open-link') {
                const absPath = PathResolver.resolve(referrer, href);
                const ws = State.workspaces.find(w => String(w.id) === String(workspaceId));
                if (ws) Tabs.create({ ...ws, path: absPath, kind: 'file', workspaceId, name: absPath.split('/').pop() });
            }
            else if (type === 'fetch-worker-script') {
                const res = await VirtualServer.fetch(workspaceId, referrer, path);
                e.source.postMessage({ source: 'parent', type: 'worker-script-response', id, content: res.text }, '*');
            }
            else if (type === 'fetch-script-content') {
                const res = await VirtualServer.fetch(workspaceId, referrer, path);
                e.source.postMessage({ source: 'parent', type: 'script-content-response', id, content: res.text, path: res.absPath }, '*');
            }
            else if (type === 'ws-connect') {
                const urlObj = new URL(url);
                NodeSystem.routeWsRequest(urlObj.port || 80, { id, url: urlObj.pathname + urlObj.search, sourceWindow: e.source });
            }
            else if (type === 'ws-client-send') {
                NodeSystem.routeWsData(id, data);
            }
            else if (type === 'ws-client-close') {
                NodeSystem.routeWsClose(id);
            }
        } catch (err) {
            const errType = type.replace('request', 'response').replace('fetch', 'response');
            e.source.postMessage({ source: 'parent', type: errType, id, error: err.message }, '*');
        }
    }
};
