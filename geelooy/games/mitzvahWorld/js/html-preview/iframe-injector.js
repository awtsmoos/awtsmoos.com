
// B"H
/**
 * @file iframe-injector.js
 * @brief Legacy Facade for the Modular Iframe System.
 */

import { IframeOrchestrator } from './iframe/Orchestrator.js';
import { ErrorSentinel } from './iframe/ErrorSentinel.js';

export const IframeInjector = {
    /**
     * B"H - Redirects to the modular orchestrator.
     */
    inject(doc, iframe, identity, tabId) {
        IframeOrchestrator.manifest(doc, iframe, identity, tabId);
    },

    /**
     * B"H - Redirects to the specialized sentinel.
     */
    writeError(iframe, msg) {
        ErrorSentinel.render(iframe, msg);
    }
};
