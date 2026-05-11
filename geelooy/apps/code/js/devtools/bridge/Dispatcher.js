
// B"H
/**
 * @file Dispatcher.js
 * @brief THE BINAH (UNDERSTANDING) OF THE BRIDGE.
 */

import { StateAccessor } from './StateAccessor.js';
import { ReplEngine } from './ReplEngine.js';

export class BridgeDispatcher {
    /**
     * B"H - Catching messages from the portal below.
     */
    static dispatch(event) {
        const data = event.data;
        if (!data || data.source !== 'html-preview-bridge') return;

        const visionId = String(data.previewTabId);
        const state = StateAccessor.getTabPersistentState(visionId);
        
        if (!state) {
            console.warn(`[BridgeDispatcher] B"H - Signal Dropped: Vision [${visionId}] has no state container.`);
            return;
        }

        const methods = {
            'console-log': () => this._record(state, data.payload),
            'dom-update': () => this._updateDOM(state, data.payload),
            'network-log': () => this._updateNetwork(state, data.payload),
            'eval-response': () => this._handleEval(state, data.payload)
        };

        const go = methods[data.type];
        if (go) {
            console.log(`%cB"H [BridgeDispatcher] REVEALED: [${data.type}] from Vision [${visionId}]`, "color: #0ff; font-weight: bold;");
            go();
        }
    }

    static _record(state, payload) {
        state.logs.push(payload);
        
        // B"H - MULTICAST EMISSION
        if (state.logListeners.size > 0) {
            state.logListeners.forEach(listener => {
                try { listener(payload); } catch(e) { console.error("[BridgeDispatcher] Listener Shevirah:", e); }
            });
        } else {
            // Absolute Fallback if no UI is actively listening
            import('../panels/console/fallback-injector.js').then(m => m.ConsoleFallbackInjector.forceInject(payload, state));
        }
        this._sync();
    }

    static _updateDOM(state, payload) {
        state.domString = payload.html;
        state.domListeners.forEach(l => { try { l(); } catch(e){} });
    }

    static _updateNetwork(state, payload) {
        state.networkReqs.push(payload);
        state.networkListeners.forEach(l => { try { l(); } catch(e){} });
        this._sync();
    }

    /**
     * B"H - RECTIFIED EVALUATION COMPLETION.
     */
    static _handleEval(state, payload) {
        const id = String(state.previewTabId);
        console.log(`%cB"H [BridgeDispatcher] EVAL_SUCCESS for Vision [${id}].`, "color: #a8ff00;");

        ReplEngine.handleResponse(payload);

        const entry = {
            level: payload.isError ? 'error' : 'log',
            args: [payload.result],
            timestamp: Date.now(),
            isEvalResult: true
        };

        state.logs.push(entry);

        if (state.logListeners.size > 0) {
            state.logListeners.forEach(listener => {
                try { listener(entry); } catch(e){}
            });
        } else {
            console.warn(`%cB"H [BridgeDispatcher] ALERT: Vision [${id}] is silent. Forcing DOM injection!`, "color: #ffae57; font-weight: bold;");
            import('../panels/console/fallback-injector.js').then(m => m.ConsoleFallbackInjector.forceInject(entry, state));
        }

        this._sync();
    }

    static _sync() {
        import('../../app.js').then(m => m.App.saveSessionDebounced());
    }
}
