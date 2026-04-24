
// B"H
/**
 * @file dispatcher.js
 * @brief THE CHANNEL ARCHITECT & GUARDIAN.
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
                // B"H - THE TIKKUN: Only return virtual content if the item is explicitly marked 
                // OR if it's the dashboard itself. Real project files (.js, .html) MUST be read from disk.
                const isVirtualType = (item.type === 'vibe-manager' || item.type === 'html-preview-file' || item.type === 'devtools');
                const isVirtualMarker = (item.isVirtual === true);

                if (isVirtualType || isVirtualMarker) {
                    console.log(`B"H - [Sentinel] Virtual Read intercepted for: ${item.path}`);
                    return item.content || `B"H - Virtual Essence: ${item.type}`;
                }
                return ogRead.apply(this, [item, ...args]);
            };
        }

        const ogWrite = FileSystemProvider.write;
        if (ogWrite) {
            FileSystemProvider.write = async function(item, ...args) {
                if (item && (item.isVirtual || item.type === 'vibe-manager' || item.type === 'html-preview-file')) {
                    return true; 
                }
                return ogWrite.apply(this, [item, ...args]);
            };
        }

        FileSystemProvider._awtsmoosVirtualGuarded = true;
    },

    async dispatch(actionId, context) {
        console.log(`B"H - Dispatching action -> [${actionId}]`);
        try {
            const actionDef = await ActionRegistry.resolve(actionId);
            const enrichedContext = (typeof context === 'object' && context !== null) ? context : { payload: context };
            await ActionExecutor.execute(actionDef, enrichedContext, actionId);
        } catch (err) {
            console.error(`B"H - Fatal Dispatch Barrier for [${actionId}]`, err);
        }
    }
};
