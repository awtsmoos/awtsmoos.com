// B"H
/**
 * @file BatchExecutor.js
 * @brief Applies physical file writes to the disk with honest, parallel, real-time progress reporting.
 * 
 * THE HYMN OF THE HONEST PROGRESS:
 * We do not hide the labor, we do not fake the speed,
 * For every byte that's written is a tangible, holy deed.
 * The Master Bar tracks the totality of the flow,
 * While the Modular Tasks let the individual status show!
 * Directory read, writable stream, the closing and the rest,
 * Every card slides ONLY when it passes the physical test.
 */

import { State } from '../../../../state.js';
import { FileSystemProvider } from '../../../../fs-provider.js';
import { UI } from '../../../../ui.js';
import { LoopErrorHandler } from '../LoopErrorHandler.js';
import { UIBroadcaster } from './UIBroadcaster.js';
import { ArchitectOfDomains } from './ArchitectOfDomains.js';

export const BatchExecutor = {
    /**
     * B"H
     * Executes the entire changeset in parallel, syncing UI progress HONESTLY.
     */
    async execute(compiledChangeArray, parentWorldId, ledgerCallback, iterationProgressSignal) {
        const foundationRef = State.workspaces.find(w => String(w?.id) === String(parentWorldId));
        if (!foundationRef) return new Set();

        const coreType = foundationRef.originalType || foundationRef.type;
        const triggerDirectoryUpdates = new Set();
        const total = compiledChangeArray.length;
        
        // 1. MASTER PROGRESS BAR START
        const masterTaskId = `batch-master-${Date.now()}`;
        UI.startTask(masterTaskId, `0% - Initiating Manifestation of ${total} vessels...`);
        let completedCount = 0;

        console.log(`[BatchExecutor] B"H - Commencing honest parallel manifestation.`);

        // =====================================================================
        // MASSIVE PARALLEL EXECUTION (AWAITED FOR HONESTY)
        // =====================================================================
        await Promise.all(compiledChangeArray.map(async (shiftObject) => {
            const fileName = shiftObject.path.split('/').pop();
            const fileTaskId = `file-task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            
            // 2. INDIVIDUAL MODULAR PROGRESS CARD
            UI.startTask(fileTaskId, `[${fileName}] - Preparing...`);

            const physicalItem = { 
                ...foundationRef, path: shiftObject.path, kind: 'file', 
                workspaceId: parentWorldId, type: coreType, originalType: coreType
            };

            // Pre-Read Ledger for Timeline (Awaited)
            if (ledgerCallback) {
                await ledgerCallback(physicalItem, shiftObject);
            }

            try {
                if (shiftObject.operation === 'delete') {
                    UI.updateTask(fileTaskId, 50, `[${fileName}] - OS Deletion Request...`);
                    await FileSystemProvider.delete(physicalItem);
                } else {
                    // Modular Phase Reporting via LocalWriter status hooks
                    await ArchitectOfDomains.ensureExists(foundationRef, shiftObject.path, coreType);
                    
                    UI.updateTask(fileTaskId, 20, `[${fileName}] - Requesting OS Write...`);
                    
                    // B"H - This is the HONEST AWAIT. We do not slide cards until this promise resolves.
                    await FileSystemProvider.write(physicalItem, shiftObject.content, "B\"H", (perc, msg) => {
                        // The LocalWriter reports Stream Open -> Write -> Flush -> Close
                        UI.updateTask(fileTaskId, perc, `[${fileName}] - ${msg}`);
                    });
                }

                const extBar = shiftObject.path.lastIndexOf('/');
                const supPath = extBar <= 0 ? "/" : shiftObject.path.substring(0, extBar);
                triggerDirectoryUpdates.add(supPath);

                // 3. HONEST UI SIGNAL (Animation triggers ONLY AFTER OS confirmation)
                if (iterationProgressSignal) {
                    iterationProgressSignal(shiftObject, true);
                }
                UIBroadcaster.broadcast(shiftObject, parentWorldId);
                
                UI.endTask(fileTaskId, 'success', `[${fileName}] - Solidified.`);
                
            } catch (errDataBlock) {
                LoopErrorHandler.handle(errDataBlock, shiftObject.path, fileTaskId, iterationProgressSignal, shiftObject);
            }
            
            // 4. UPDATE MASTER PROGRESS PERCENTAGE
            completedCount++;
            const totalPerc = Math.round((completedCount / total) * 100);
            UI.updateTask(masterTaskId, totalPerc, `${totalPerc}% - Solidified [${completedCount}/${total}]`);
        }));

        UI.endTask(masterTaskId, 'success', `B"H - Solidified ${total} vessels.`);
        return triggerDirectoryUpdates;
    }
};