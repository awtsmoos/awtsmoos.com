
// B"H
/**
 * @file dispatcher.js
 * @brief The Channel Architect & Guardian.
 */

import { ActionRegistry } from './registry.js';
import { ActionExecutor } from './executor.js';
import { FileSystemProvider } from '../fs-provider.js';

export const ActionDispatcher = {
    init() {
        if (FileSystemProvider._awtsmoosVirtualGuarded) return;

        console.log("B\"H - ActionDispatcher: Manifesting Virtual Sentinel.");

        const ogRead = FileSystemProvider.read;
        if (ogRead) {
            FileSystemProvider.read = async function(item, ...args) {
                const isVirtualType = ['vibe-manager', 'html-preview-file', 'devtools', 'browser'].includes(item.type);
                const isVirtualMarker = (item.isVirtual === true);

                if (isVirtualType || isVirtualMarker) {
                    if (item.content !== undefined && item.content !== null && item.content !== "") {
                        return item.content;
                    }
                    console.log("[Sentinel] B\"H - Virtual vessel " + item.path + " is empty. Diving to physical depth.");
                }
                
                return await ogRead.apply(this, [item, ...args]);
            };
        }

        FileSystemProvider._awtsmoosVirtualGuarded = true;
    },

    async dispatch(actionId, context) {
        console.log("B\"H - Dispatching action -> [" + actionId + "]");
        try {
            const actionDef = await ActionRegistry.resolve(actionId);
            const enrichedContext = (typeof context === 'object' && context !== null) ? context : { payload: context };
            await ActionExecutor.execute(actionDef, enrichedContext, actionId);
        } catch (err) {
            console.error("B\"H - Fatal Dispatch Barrier for [" + actionId + "]", err);
            try {
                const { UI } = await import('../ui.js');
                UI.showToast(`Action failed: ${err.message || err}`, 'error', 9000);
            } catch (_) {}
        }
    }
};
