
// B"H
// FILE: js/devtools/bridge.js

import { State } from '../state.js';

export const DevToolsBridge = {
    attachedStates: new Map(), // previewTabId -> devtoolsState
    initialized: false,

    attach(state) {
        if (state && state.previewTabId) {
            this.attachedStates.set(state.previewTabId, state);
            // console.log(`[DevToolsBridge] B"H - Attached state for Tab: ${state.previewTabId}`);
        }
        
        if (!this.initialized) {
            window.addEventListener('message', this.handle.bind(this));
            this.initialized = true;
        }
    },

    handle(e) {
        const d = e.data;
        if (!d || d.source !== 'html-preview-bridge') return;

        const state = this.attachedStates.get(d.previewTabId);
        
        if (!state) {
            // console.warn(`[DevToolsBridge] B"H - Received message for detached/unknown tab: ${d.previewTabId}`, d);
            return;
        }

        if (d.type === 'console-log') {
            state.logs.push(d.payload);
            if (state.onLog) state.onLog(d.payload);
        } 
        else if (d.type === 'eval-response') {
            // B"H - This is the Critical Path for User Commands
            const resultLog = { 
                level: d.payload.isError ? 'error' : 'log', 
                args: [d.payload.result],
                timestamp: Date.now()
            };
            state.logs.push(resultLog);
            if (state.onLog) state.onLog(resultLog);
        }
        else if (d.type === 'dom-update') {
            state.domString = d.payload.html;
            if (state.onDomUpdate) state.onDomUpdate();
        }
        else if (d.type === 'network-log') {
            state.networkReqs.push(d.payload);
            if (state.onNetworkLog) state.onNetworkLog();
        }
    },

    sendEval(previewTabId, code) {
        import('../editor/preview-manager.js').then(m => {
            const iframe = m.PreviewManager.getIframe(previewTabId);
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    source: 'devtools-bridge',
                    type: 'eval-request',
                    id: Date.now(),
                    code
                }, '*');
            } else {
                console.error(`[DevToolsBridge] B"H - Iframe not found for eval target: ${previewTabId}`);
            }
        });
    },

    requestDOM(previewTabId) {
        import('../editor/preview-manager.js').then(m => {
            const iframe = m.PreviewManager.getIframe(previewTabId);
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'request-dom' }, '*');
            }
        });
    }
};
