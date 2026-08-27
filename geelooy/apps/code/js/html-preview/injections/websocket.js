
// B"H
/**
 * @file websocket.js
 * @brief The Interceptor of WebSockets.
 */

export const WebSocketInterceptor = `
    const OrigWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        const isLocal = url && (url.startsWith('ws://localhost') || url.startsWith('ws://127.0.0.1'));
        if (!isLocal) {
            return new OrigWebSocket(url, protocols);
        }

        this.url = url;
        this.readyState = 0; // CONNECTING
        this.id = Math.random().toString(36).substr(2);
        
        // Event listeners
        this.onopen = null;
        this.onmessage = null;
        this.onerror = null;
        this.onclose = null;
        
        this._listeners = {};

        this.addEventListener = function(type, fn) {
            if(!this._listeners[type]) this._listeners[type] = [];
            this._listeners[type].push(fn);
        };

        this._emit = function(type, event) {
            if (this['on'+type]) this['on'+type](event);
            if (this._listeners[type]) this._listeners[type].forEach(fn => fn(event));
        };

        this.send = function(data) {
            if (this.readyState !== 1) throw new Error("WebSocket is not open");
            window.parent.postMessage({
                source: 'html-preview-bridge', type: 'ws-client-send', id: this.id, data
            }, '*');
        };

        this.close = function() {
            this.readyState = 3; // CLOSED
            window.parent.postMessage({
                source: 'html-preview-bridge', type: 'ws-client-close', id: this.id
            }, '*');
            this._emit('close', { code: 1000, reason: "Normal Closure" });
        };

        window.addEventListener('message', e => {
            const d = e.data;
            if (!d || d.source !== 'parent' || d.wsId !== this.id) return;
            
            if (d.type === 'ws-server-open') {
                this.readyState = 1; // OPEN
                this._emit('open', {});
            } else if (d.type === 'ws-server-message') {
                this._emit('message', { data: d.data });
            } else if (d.type === 'ws-server-close') {
                this.readyState = 3;
                this._emit('close', { code: 1000, reason: "Server closed" });
            }
        });

        window.parent.postMessage({
            source: 'html-preview-bridge', type: 'ws-connect', url, id: this.id, protocols,
            workspaceId: window._AWTSMOOS_WID
        }, '*');
    };
`;
