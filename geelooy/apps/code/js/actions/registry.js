// B"H
/**
 * @file registry.js
 * @brief THE UNIFIED LEDGER OF ACTION.
 * @description
 * B"H. Every command is a spark looking for its vessel. The Awtsmoos lets the
 * registry bind known actions immediately and lazily import deeper commands
 * only when their hour arrives. The AI chat path is rooted at `/ai/` because
 * this server already serves from the `geelooy` directory; `/geelooy/ai/`
 * doubles the world into `geelooy/geelooy` and falls into dynamic-route void.
 */

import { CORE_FILE_ACTIONS } from './categories/file-core.js';
import { UI_LAYOUT_ACTIONS } from './categories/ui-layout.js';
import { TAB_MANAGEMENT_ACTIONS } from './categories/tab-mgmt.js';
import { PREVIEW_DEVTOOLS_ACTIONS } from './categories/preview-dev.js';
import { DATA_TRANSFER_ACTIONS } from './categories/data-transfer.js';
import { TEXT_TRANS_ACTIONS } from './categories/text-trans.js';
import { MenuUI } from '../menus/ui.js';

const COMMAND_CACHE = new Map();

/**
 * B"H. Builds URLs from the real app root, not an assumed filesystem prefix.
 * @param {string} path Absolute web path.
 * @returns {string} Browser-safe URL.
 */
function appUrl(path) {
    return new URL(path, location.origin).toString();
}

/**
 * B"H. Opens the standalone Rosie/MiniMax chat vessel in the inner browser.
 * @returns {Promise<any>} Browser tab result.
 */
async function openGenericAiChat() {
    const m = await import('../browser/index.js');
    const url = appUrl('/ai/?awtsmoosAi=minimax');
    return m.BrowserManager.open(url, { name: 'AI Chat' });
}

/**
 * B"H. Opens the inner browser tab.
 * @returns {Promise<any>} Browser tab result.
 */
async function openBrowserTab() {
    const m = await import('../browser/index.js');
    return m.BrowserManager.open();
}

/**
 * B"H. Opens devtools against preview or browser vessels.
 * @param {object} ctx Action context.
 * @returns {Promise<any>} DevTools open result.
 */
async function openDevTools(ctx) {
    const module = await import('../devtools/open.js');
    return module.DevToolsOpener.open(ctx);
}

const FALLBACK_ACTIONS = {
    ...CORE_FILE_ACTIONS,
    ...UI_LAYOUT_ACTIONS,
    ...TAB_MANAGEMENT_ACTIONS,
    ...PREVIEW_DEVTOOLS_ACTIONS,
    ...DATA_TRANSFER_ACTIONS,
    ...TEXT_TRANS_ACTIONS,
    'cancel-menu': () => MenuUI.hideAll(),
    'reveal-in-workspace': async (ctx) => (await import('./commands/reveal-in-workspace.js')).default(ctx),
    'open-browser-tab': openBrowserTab,
    'open-generic-ai-chat': openGenericAiChat,
    'open-devtools': openDevTools
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
            const module = await import('./commands/' + actionId + '.js');
            const executor = module.default || Object.values(module).find(exp => typeof exp === 'function');
            if (executor) COMMAND_CACHE.set(actionId, executor);
            return executor || null;
        } catch (e) {
            console.error('B"H - Registry Error: Action [' + actionId + '] could not be found.', e);
            return null;
        }
    }
};
