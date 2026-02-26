
// B"H
/**
 * @file bridge.js
 * @brief The Eternal Connection between Editor and Preview.
 */

import { State } from '../state.js';

export const DevToolsBridge = {
    /**
     * @constant _persistentStateMap
     * @description holds data for preview Tab IDs.
     */
    _persistentStateMap: new Map(),
    initialized: false,

    /**
     * @function init
     * @description Starts listening for iframe communications immediately.
     */
    init() {
        if (this.initialized) return;
        window.addEventListener('message', (e) => this.handle(e));
        this.initialized = true;
        console.log("B\"H - DevToolsBridge: Listening for the hidden pulses of the network.");
    },

    getTabPersistentState(tabId, metadata = null) {
        if (!this._persistentStateMap.has(tabId)) {
            const newState = {
                previewTabId: tabId,
                logs: metadata?.logs || [],
                networkReqs: metadata?.networkReqs || [],
                domString: '',
                activePanel: metadata?.activePanel || 'console',
                selectedPath: metadata?.selectedPath || null,
                inspectPath: null,
                expandedPaths: new Set(metadata?.expandedPaths || ['']),
                mainWrapper: null
            };
            this._persistentStateMap.set(tabId, newState);
        }
        return this._persistentStateMap.get(tabId);
    },

    handle(e) {
        const d = e.data;
        if (!d || d.source !== 'html-preview-bridge') return;

        const pState = this.getTabPersistentState(d.previewTabId);
        
        if (d.type === 'console-log') {
            pState.logs.push(d.payload);
            if (pState.onLog) pState.onLog(d.payload);
            this.requestSave();
        } 
        else if (d.type === 'eval-response') {
            const resultLog = { level: d.payload.isError ? 'error' : 'log', args: [d.payload.result], timestamp: Date.now() };
            pState.logs.push(resultLog);
            if (pState.onLog) pState.onLog(resultLog);
            this.requestSave();
        }
        else if (d.type === 'dom-update') {
            pState.domString = d.payload.html;
            if (pState.onDomUpdate) pState.onDomUpdate();
        }
        else if (d.type === 'network-log') {
            pState.networkReqs.push(d.payload);
            if (pState.onNetworkLog) pState.onNetworkLog();
            this.requestSave();
        }
    },

    requestSave() {
        // Debounced save through the app orchestrator
        import('../app.js').then(m => m.App.saveSessionDebounced());
    },

    sendEval(previewTabId, code) {
        import('../editor/preview-manager.js').then(m => {
            const iframe = m.PreviewManager.getIframe(previewTabId);
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({ source: 'devtools-bridge', type: 'eval-request', id: Date.now(), code }, '*');
            }
        });
    },

    requestDOM(previewTabId) {
        import('../editor/preview-manager.js').then(m => {
            const iframe = m.PreviewManager.getIframe(previewTabId);
            if (iframe && iframe.contentWindow) iframe.contentWindow.postMessage({ type: 'request-dom' }, '*');
        });
    },

    setSelectedPath(previewTabId, path) {
        import('../editor/preview-manager.js').then(m => {
            const iframe = m.PreviewManager.getIframe(previewTabId);
            if (iframe && iframe.contentWindow) iframe.contentWindow.postMessage({ type: 'set-selected-path', path }, '*');
        });
    }
};
