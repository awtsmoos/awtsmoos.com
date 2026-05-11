
// B"H
/**
 * @file message-bridge.js
 * @brief The Master Messenger.
 * 
 * NOVEL OF THE PURIFIED CONNECTION:
 * A signal is sent from the depth of the frame,
 * Carrying the path and the physical name.
 * We catch it with single-quotes, steady and true,
 * Passing the message from me and to you.
 * No error shall rise from a rogue backtick's hand,
 * For order now rules in this digital land.
 */

import { VirtualServer } from './virtual-server.js';
import { Tabs } from '../tabs/index.js';
import { State } from '../state.js';
import { PathResolver } from './resolver.js';
import { VirtualNetwork } from '../network/index.js'; 
import { NodeSystem } from '../node/index.js';
import { DevToolsBridge } from '../devtools/bridge.js';
import { MenuUI } from '../menus/ui.js';

export const MessageBridge = {
    initialized: false,

    init() {
        if (this.initialized) return;
        console.log("B\"H - MessageBridge: Initializing Communication.");
        window.addEventListener('message', (e) => this.handle(e));
        if (DevToolsBridge && typeof DevToolsBridge.init === 'function') {
            DevToolsBridge.init();
        }
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
                if (ws && d.previewTabId) {
                    const newItem = { ...ws, path: absPath, kind: 'file', workspaceId: ws.id, type: ws.originalType || ws.type, name: absPath.split('/').pop() };
                    Tabs.updatePreviewContext(d.previewTabId, newItem);
                }
            }
            else if (type === 'context-menu') {
                // B"H - RECTIFIED SELECTOR: Pure concatenation
                const iframeElement = document.querySelector('iframe[data-tab-id="' + d.previewTabId + '"]');
                if (!iframeElement) return;
                
                const rect = iframeElement.getBoundingClientRect();
                const clientX = rect.left + d.x;
                const clientY = rect.top + d.y;
                
                const menuItems =[];
                if (d.href) {
                    menuItems.push({ label: "Open Link", action: "preview-nav-link", icon: "play" });
                    menuItems.push({ label: "Open in New Tab", action: "preview-new-tab", icon: "external-link" });
                    menuItems.push({ isSeparator: true });
                }
                menuItems.push({ label: "Inspect Element", action: "preview-inspect", icon: "search" });
                menuItems.push({ label: "Open Console", action: "preview-open-console", icon: "laptop" });
                menuItems.push({ isSeparator: true });
                menuItems.push({ label: "View Source", action: "preview-view-source", icon: "code" });
                menuItems.push({ isSeparator: true });
                menuItems.push({ label: "Copy Text", action: "preview-copy", icon: "copy", disabled: !d.hasSelection });
                menuItems.push({ label: "Select All", action: "preview-select-all", icon: "select-all" });
                menuItems.push({ isSeparator: true });
                menuItems.push({ label: "Cancel", action: "cancel-menu", icon: "x" });
                
                State.contextPayload = d;
                MenuUI.renderMenu(document.getElementById('context-menu'), menuItems, { clientX, clientY });
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
    },

    sendCommandToIframe(tabId, cmd) {
        const iframeElement = document.querySelector('iframe[data-tab-id="' + tabId + '"]');
        if (iframeElement && iframeElement.contentWindow) {
            iframeElement.contentWindow.postMessage({ type: 'iframe-exec-cmd', cmd }, '*');
        }
    }
};
