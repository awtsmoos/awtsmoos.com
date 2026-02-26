
// B"H
/**
 * @file dispatcher.js
 * @brief THE CHANNEL ARCHITECT & GUARDIAN.
 */

import { ActionRegistry } from './registry.js';
import { ActionExecutor } from './executor.js';
import { FileSystemProvider } from '../fs-provider.js';

export const ActionDispatcher = {
    /**
     * @function init
     * @description B"H - The Sacred Shielding Ritual.
     * Called once during app initialization to protect physical disks from virtual forms.
     */
    init() {
        if (FileSystemProvider._awtsmoosVirtualGuarded) return;

        console.log("B\"H - ActionDispatcher: Manifesting Virtual Sentinel over FileSystem.");

        // Guardian of Reading
        const ogRead = FileSystemProvider.read;
        if (ogRead) {
            FileSystemProvider.read = async function(item, ...args) {
                if (item && (item.isVirtual || item.type === 'awtsmoos-vibe-visualizer' || item.type === 'html-preview-file' || item.type === 'vibe-manager')) {
                    return item.content || `B"H - Pure Essence: ${item.type}`;
                }
                return ogRead.apply(this, [item, ...args]);
            };
        }

        // Guardian of Writing
        const ogWrite = FileSystemProvider.write;
        if (ogWrite) {
            FileSystemProvider.write = async function(item, ...args) {
                if (item && (item.isVirtual || item.type === 'awtsmoos-vibe-visualizer' || item.type === 'html-preview-file' || item.type === 'vibe-manager')) {
                    return true; 
                }
                return ogWrite.apply(this, [item, ...args]);
            };
        }

        // Ultimate Depth Guardian (Raw Executions)
        const ogExec = FileSystemProvider._execute;
        if (ogExec) {
            FileSystemProvider._execute = async function(action, item, ...args) {
                if (item && (item.isVirtual || item.type === 'awtsmoos-vibe-visualizer' || item.type === 'html-preview-file' || item.type === 'vibe-manager')) {
                    if (action === 'read') return item.content || `B"H - ${item.name} activated`;
                    return true;
                }
                return ogExec.apply(this, [action, item, ...args]);
            };
        }

        FileSystemProvider._awtsmoosVirtualGuarded = true;
    },

    /**
     * B"H - Transmits parameters and invokes executor cleanly.
     * @param {string} actionId 
     * @param {object} context 
     */
    async dispatch(actionId, context) {
        console.log(`B"H - Dispatching action -> [${actionId}]`);
        
        try {
            const actionDef = await ActionRegistry.resolve(actionId);
            
            const enrichedContext = (typeof context === 'object' && context !== null) ? context : { payload: context };
            enrichedContext._debugId = actionId;

            await ActionExecutor.execute(actionDef, enrichedContext, actionId);
        } catch (err) {
            console.error(`B"H - Fatal Dispatch Barrier for [${actionId}]`, err);
        }
    }
};
