
// B"H
/**
 * @file registry.js
 * @brief THE UNIFIED LEDGER OF ACTION.
 */

import { CORE_FILE_ACTIONS } from './categories/file-core.js';
import { UI_LAYOUT_ACTIONS } from './categories/ui-layout.js';
import { TAB_MANAGEMENT_ACTIONS } from './categories/tab-mgmt.js';
import { PREVIEW_DEVTOOLS_ACTIONS } from './categories/preview-dev.js';
import { DATA_TRANSFER_ACTIONS } from './categories/data-transfer.js';
import { TEXT_TRANS_ACTIONS } from './categories/text-trans.js';
import { MenuUI } from '../menus/ui.js';

const COMMAND_CACHE = new Map();

const FALLBACK_ACTIONS = {
    ...CORE_FILE_ACTIONS,
    ...UI_LAYOUT_ACTIONS,
    ...TAB_MANAGEMENT_ACTIONS,
    ...PREVIEW_DEVTOOLS_ACTIONS,
    ...DATA_TRANSFER_ACTIONS,
    ...TEXT_TRANS_ACTIONS,
    
    'cancel-menu': () => MenuUI.hideAll(),
    'reveal-in-workspace': async (ctx) => {
        const module = await import('./commands/reveal-in-workspace.js');
        return module.default(ctx);
    },
    'open-browser-tab': async () => {
        const m = await import('../browser/index.js');
        return m.BrowserManager.open();
    },
    'open-devtools': async (ctx) => {
        // B"H - The high-level command to open inspection vessels.
        // It can now handle standard previews AND the new browser tabs.
        const module = await import('../devtools/open.js');
        return module.DevToolsOpener.open(ctx);
    }
};

export const ActionRegistry = {
    async resolve(actionId) {
        if (COMMAND_CACHE.has(actionId)) return COMMAND_CACHE.get(actionId);
        
        if (FALLBACK_ACTIONS[actionId]) {
            const handler = FALLBACK_ACTIONS[actionId];
            COMMAND_CACHE.set(actionId, handler);
            return handler;
        }

        try {
            const path = './commands/' + actionId + '.js';
            const module = await import(path);
            const executor = module.default || Object.values(module).find(exp => typeof exp === 'function');
            
            if (executor) {
                COMMAND_CACHE.set(actionId, executor);
                return executor;
            }
        } catch(e) {
            console.error("B\"H - Registry Error: Action [" + actionId + "] could not be found.", e);
            return null;
        }
    }
};
