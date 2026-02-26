
// B"H
// FILE: js/devtools/bridge.js

import { State } from '../state.js';

export const DevToolsBridge = {
    attachedStates: new Map(), // previewTabId -> devtoolsState
    initialized: false,

    attach(state) {
        this.attachedStates.set(state.previewTabId, state);
        if (!this.initialized) {
            window.addEventListener('message', this.handle.bind(this));
            this.initialized = true;
        }
    },

    handle(e) {
        const d = e.data;
        if (!d || d.source !== 'html-preview-bridge') return;

        const state = this.attachedStates.get(d.previewTabId);
        if (!state) return;

        if (d.type === 'console-log') {
            state.logs.push(d.payload);
            if (state.onLog) state.onLog(d.payload);
        } 
        else if (d.type === 'eval-response') {
            state.logs.push({ level: d.payload.isError ? 'error' : 'log', args:[d.payload.result] });
            if (state.onLog) state.onLog(state.logs[state.logs.length-1]);
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
            const f = m.PreviewManager.getIframe(previewTabId);
            if (f && f.contentWindow) {
                f.contentWindow.postMessage({
                    source: 'devtools-bridge',
                    type: 'eval-request',
                    id: Date.now(),
                    code
                }, '*');
            }
        });
    },

    requestDOM(previewTabId) {
        import('../editor/preview-manager.js').then(m => {
            const f = m.PreviewManager.getIframe(previewTabId);
            if (f && f.contentWindow) {
                f.contentWindow.postMessage({ type: 'request-dom' }, '*');
            }
        });
    }
};
