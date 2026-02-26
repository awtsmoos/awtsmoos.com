
// B"H
/**
 * @file index.js
 * @brief The Keter of the Injections.
 */

import { ClickInterceptor } from './click.js';
import { FetchInterceptor } from './fetch.js';
import { WorkerInterceptor } from './worker.js';
import { ConsoleInterceptor } from './console.js';
import { DOMInterceptor } from './dom.js';
import { WebSocketInterceptor } from './websocket.js';
import { ContextMenuInterceptor } from './contextmenu.js'; // B"H - Included

export const InjectionAssembler = {
    getNetworkInterceptorScript(workspaceId, referrerPath, tabId) {
        return `
            (function() {
                window._AWTSMOOS_WID = ${JSON.stringify(workspaceId)};
                window._AWTSMOOS_REF = ${JSON.stringify(referrerPath)};
                window._AWTSMOOS_TAB_ID = ${JSON.stringify(tabId)};
                
                ${ClickInterceptor}
                ${ContextMenuInterceptor}
                ${FetchInterceptor}
                ${WorkerInterceptor}
                ${ConsoleInterceptor}
                ${DOMInterceptor}
                ${WebSocketInterceptor}
            })();
        `;
    }
};
