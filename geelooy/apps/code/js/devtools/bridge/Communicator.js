
// B"H
/**
 * @file Communicator.js
 * @brief THE HERALD OF THE HIGHER DECREE.
 */

import { State } from '../../state.js';

export class BridgeCommunicator {
    static requestDOM(tabId) { this._transmit(tabId, { type: 'request-dom' }); }

    static sendEval(tabId, code, requestId) {
        this._transmit(tabId, {
            source: 'devtools-bridge',
            type: 'eval-request',
            id: requestId,
            code: code
        });
    }

    static setSelectedPath(tabId, path) { this._transmit(tabId, { type: 'set-selected-path', path: path }); }

    /**
     * @private
     */
    static _transmit(tabId, message) {
        let targetId = String(tabId);
        
        // B"H - If the initial path is broken, we seek the truth from the active dimension.
        if (targetId === "undefined" || targetId === "null") {
            const devToolsTab = State.tabs.find(t => t.id === State.activeTabId && t.fileType === 'devtools');
            if (devToolsTab && devToolsTab.item.previewTabId) {
                targetId = String(devToolsTab.item.previewTabId);
                 console.log(`%c[Communicator] B"H - Target coordinate rectified to active Vision [${targetId}]`, "color: #ffae57;");
            }
        }
        
        console.log(`[Communicator] B"H - Transmitting to FINAL Vision [${targetId}]: ${message.type}`);

        import('../../editor/preview-manager.js').then(m => {
            let frame = m.PreviewManager.getIframe(targetId);

            if (!frame) {
                // If it's a browser tab, the iframe is nested one level deeper.
                const browserWrapper = document.getElementById('browser-wrapper');
                const browserFrame = browserWrapper ? browserWrapper.querySelector('iframe.browser-iframe') : null;
                if(browserFrame) {
                    frame = browserFrame;
                }
            }

            if (!frame) {
                frame = document.querySelector(`iframe[data-tab-id="${targetId}"]`);
                if (frame) m.PreviewManager.registerIframe(targetId, frame);
            }
            
            // THE ABSOLUTE FALLBACK
            if (!frame) {
                const iframes = document.querySelectorAll('iframe.browser-iframe');
                if (iframes.length > 0) {
                    frame = iframes[iframes.length - 1]; // Use the most recently added iframe
                    targetId = frame.dataset.tabId;
                    console.log(`%c[Communicator] B"H - ABSOLUTE FALLBACK: Found physical iframe [${targetId}].`, "color: #ff00ff; font-weight:bold;");
                }
            }

            if (frame && frame.contentWindow) {
                frame.contentWindow.postMessage(message, '*');
                console.log(`%cB"H [Communicator] - Signal Grounded in Vision [${targetId}].`, "color: #a8ff00;");
            } else {
                console.error(`%cB"H [Communicator] - FATAL: Vision Portal [${targetId}] is non-existent or detached.`, "color: #f75d65; font-weight: bold;");
            }
        });
    }
}
