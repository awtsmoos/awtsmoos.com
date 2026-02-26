
// B"H
/**
 * @file bridge.js
 * @brief The Eternal Connection between Preview and DevTools.
 */

import { State } from '../state.js';

export const DevToolsBridge = {
    /**
     * @constant _persistentStateMap
     * @description Holds logs, network, and DOM state for all tabs.
     * key: previewTabId -> value: { logs:[], network:[], domString:'' }
     */
    _persistentStateMap: new Map(),
    initialized: false,

    /**
     * @function init
     * @description Binds global message listeners once.
     */
    init() {
        if (this.initialized) return;
        window.addEventListener('message', this.handle.bind(this));
        this.initialized = true;
    },

    /**
     * @function getTabPersistentState
     * @description Retrieves or creates a lasting memory vessel for a specific tab.
     */
    getTabPersistentState(tabId) {
        if (!this._persistentStateMap.has(tabId)) {
            this._persistentStateMap.set(tabId, {
                previewTabId: tabId,
                logs: [],
                networkReqs: [],
                domString: '',
                activePanel: 'console'
            });
        }
        return this._persistentStateMap.get(tabId);
    },

    /**
     * @function handle
     * @description Catches prayers (messages) from preview iframes and manifests them in memory.
     */
    handle(e) {
        const d = e.data;
        if (!d || d.source !== 'html-preview-bridge') return;

        // B"H - Capture everything into the eternal registry
        const pState = this.getTabPersistentState(d.previewTabId);
        
        if (d.type === 'console-log') {
            pState.logs.push(d.payload);
            // If the physical UI is currently manifested, notify it instantly
            if (pState.onLog) pState.onLog(d.payload);
        } 
        else if (d.type === 'eval-response') {
            const resultLog = { 
                level: d.payload.isError ? 'error' : 'log', 
                args: [d.payload.result],
                timestamp: Date.now()
            };
            pState.logs.push(resultLog);
            if (pState.onLog) pState.onLog(resultLog);
        }
        else if (d.type === 'dom-update') {
            pState.domString = d.payload.html;
            if (pState.onDomUpdate) pState.onDomUpdate();
        }
        else if (d.type === 'network-log') {
            pState.networkReqs.push(d.payload);
            if (pState.onNetworkLog) pState.onNetworkLog();
        }
    },

    /**
     * @function sendEval
     * @description Beams code directly into the target iframe's consciousness.
     */
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
                console.error(`[DevToolsBridge] B"H - Target vessel not found: ${previewTabId}`);
            }
        });
    },

    /**
     * @function requestDOM
     * @description Commands the iframe to reveal its current structural reality.
     */
    requestDOM(previewTabId) {
        import('../editor/preview-manager.js').then(m => {
            const iframe = m.PreviewManager.getIframe(previewTabId);
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'request-dom' }, '*');
            }
        });
    }
};
