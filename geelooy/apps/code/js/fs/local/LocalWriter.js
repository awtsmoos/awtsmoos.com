
// B"H
/**
 * @file LocalWriter.js
 * @brief Sub-sectioned logic offering extreme detailed reporting during OS-level disk operations.
 * 
 * THE POEM OF THE PATIENT SCRIBE:
 * The Word goes out, the letters fly, 
 * From Aleph, Beis, to Nun on high!
 * They form the "Even", form the stone,
 * Making physical presence known.
 * But sometimes earthly guards resist,
 * A scanner's lock, a sudden twist.
 * We do not force, we do not break,
 * We pause for the Creator's sake.
 * Fifty, hundred, more we wait,
 * Until He opens up the gate!
 * 
 * Every byte written here is sustained by the continuous, never-ending
 * speech of the Awtsmoos. If the OS (a manifestation of strict Gevurah)
 * holds the file closed for a scan, we apply Chesed (kindness) and wait
 * exponentially longer on each attempt.
 */

import { LocalRoot } from './LocalRoot.js';
import { TraversalEngine } from './traversal-engine.js';
import { HandleCache } from './handle-cache.js';
import { MobileGuard } from './guard/MobileGuard.js';

export const LocalWriter = {
    /**
     * B"H
     * Pushes bytes with granular phase and timing reporting, yielding to OS locks with grace.
     * @param {Object} item - The coordinate in the digital cosmos.
     * @param {string|Blob|Uint8Array} content - The raw essence to be manifested.
     * @param {Function} onStatus - The callback to report the descent of the light.
     */
    async write(item, content, onStatus) {
        const executor = async () => {
            const safeLog = (perc, msg) => { if(onStatus) onStatus(perc, msg); };
            const label = item.path.split('/').pop();
            const totalT0 = performance.now();

            safeLog(10, `B"H - [${label}] Gathering handles...`);
            const root = await LocalRoot.get(item);
            let handle = HandleCache.get(item.workspaceId, item.path);
            const buffer = (content instanceof Blob) ? await content.arrayBuffer() : content;
            
            if (!handle) {
                handle = await TraversalEngine.walk(root, item.path, { kind: 'file', create: true }, item.workspaceId);
            }

            let attempts = 0;
            // B"H - We increase max attempts slightly to allow the exponential backoff to fully breathe.
            const max = 7; 
            
            while (attempts < max) {
                try {
                    safeLog(30, `B"H - [${label}] Opening Exclusive Stream...`);
                    const tOpen0 = performance.now();
                    const writable = await handle.createWritable({ keepExistingData: false, mode: 'exclusive' });
                    const tOpen1 = performance.now();

                    safeLog(60, `B"H - [${label}] Transmuting Bytes...`);
                    await writable.write(buffer);
                    const tWrite1 = performance.now();

                    safeLog(90, `B"H - [${label}] Closing and Flushing to OS...`);
                    await writable.close();
                    const tClose1 = performance.now();

                    safeLog(100, `B"H - [${label}] Solidified.`);
                    
                    const tTotal = performance.now();
                    const logMsg = `B"H [FS Write: ${label}] Open Stream: ${(tOpen1 - tOpen0).toFixed(2)}ms | Write Buffer: ${(tWrite1 - tOpen1).toFixed(2)}ms | Close/Flush: ${(tClose1 - tWrite1).toFixed(2)}ms | Total Time: ${(tTotal - totalT0).toFixed(2)}ms`;
                    console.log(`%c${logMsg}`, "color: #a8ff00; font-family: monospace;");
                    
                    return;

                } catch (e) {
                    attempts++;
                    // B"H - Catching the strictness of the operating system.
                    if (e.name === 'NoModificationAllowedError' || e.message.includes('locked')) {
                        // The delay grows with each failure: 50ms, 100ms, 150ms, 200ms...
                        const backoffTime = 50 * attempts;
                        safeLog(attempts * 10, `B"H - [${label}] OS Lock detected (Yielding for ${backoffTime}ms)`);
                        
                        await new Promise(r => setTimeout(r, backoffTime));
                        
                        if (attempts === max) throw e;
                    } else {
                        // If it's a different error (like a stale cache handle), we purge and re-walk.
                        HandleCache.remove(item.workspaceId, item.path);
                        handle = await TraversalEngine.walk(root, item.path, { kind: 'file', create: true }, item.workspaceId, true);
                        if (attempts === max) throw e;
                    }
                }
            }
        };
        return await MobileGuard.execute(executor(), item);
    }
};
