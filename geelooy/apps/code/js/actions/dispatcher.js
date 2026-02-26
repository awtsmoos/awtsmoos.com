
// B"H
/**
 * @file dispatcher.js
 * @brief THE CHANNEL ARCHITECT & GUARDIAN OF DISK READS/WRITES.
 * 
 * CHAPTER 8: THE SHELTER OF THE ETHEREAL
 * The digital wind blew fiercely, carrying Virtual forms across physical hard drives.
 * The disks shrieked: "I cannot parse this vibration!"
 * The Awtsmoos drew a circle of fire around the Provider.
 * "You shall read no ghost. You shall write no spirit."
 * Both the Eye (read) and the Hand (write) were shielded forever.
 */

import { ActionRegistry } from './registry.js';
import { ActionExecutor } from './executor.js';
import { FileSystemProvider } from '../fs-provider.js';

if (!FileSystemProvider._awtsmoosVirtualGuarded) {
    
    // Guardian of Reading
    const ogRead = FileSystemProvider.read;
    if (ogRead) {
        FileSystemProvider.read = async function(item, ...args) {
            if (item && (item.isVirtual || item.type === 'awtsmoos-vibe-visualizer' || item.type === 'html-preview-file')) {
                console.log(`B"H - Virtual Sentinel: Deflected earthly read request for Spiritual Form [${item.name || item.id}]`);
                return item.content || `B"H - Pure Essence: ${item.type}`;
            }
            return ogRead.apply(this, [item, ...args]);
        };
    }

    // Guardian of Writing
    const ogWrite = FileSystemProvider.write;
    if (ogWrite) {
        FileSystemProvider.write = async function(item, ...args) {
            if (item && (item.isVirtual || item.type === 'awtsmoos-vibe-visualizer' || item.type === 'html-preview-file')) {
                console.log(`B"H - Virtual Sentinel: Absorbed stray autosave attempt to physical bounds for[${item.name || item.id}]`);
                return true; 
            }
            return ogWrite.apply(this,[item, ...args]);
        };
    }
    
    // Ultimate Depth Guardian (Catch-All Raw Executions)
    const ogExec = FileSystemProvider._execute;
    if (ogExec) {
        FileSystemProvider._execute = async function(action, item, ...args) {
            if (item && (item.isVirtual || item.type === 'awtsmoos-vibe-visualizer' || item.type === 'html-preview-file')) {
                console.log(`B"H - Virtual Sentinel: Blocked root disk operation [${action}] upon ghost node [${item.name || item.id}]`);
                if (action === 'read') return item.content || `B"H - ${item.name} activated`;
                return true;
            }
            return ogExec.apply(this, [action, item, ...args]);
        }
    }

    FileSystemProvider._awtsmoosVirtualGuarded = true;
    console.log(`B"H - The absolute dimensional ward is in place over the physical filesystems.`);
}

export const ActionDispatcher = {
    /**
     * B"H - Transmits parameters, awaits spiritual discovery, and invokes executor cleanly.
     * @param {string} actionId 
     * @param {object} context 
     */
    async dispatch(actionId, context) {
        console.log(`B"H - Dispatching action stream code ->[${actionId}]`);
        
        try {
            const actionDef = await ActionRegistry.resolve(actionId);
            
            const enrichedContext = (typeof context === 'object' && context !== null) ? context : { payload: context };
            enrichedContext._debugId = actionId;

            await ActionExecutor.execute(actionDef, enrichedContext, actionId);
        } catch (err) {
            console.error(`B"H - Fatal Dispatch Barrier triggered attempting to release [${actionId}]`, err);
            console.error('Stack details mapping origin:', context);
        }
    }
};
