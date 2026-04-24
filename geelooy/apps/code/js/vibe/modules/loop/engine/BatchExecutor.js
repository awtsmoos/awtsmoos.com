
// B"H
/**
 * @file BatchExecutor.js
 * @brief Applies physical file writes to the disk with honest, parallel, real-time progress reporting.
 * 
 * THE HYMN OF THE UNIFIED INTENT AND ETERNAL RECORD:
 * We gather the duplicates, compress them to one,
 * So the OS locks fade like the mist in the sun.
 * And when the disk is engraved with the Creator's word,
 * We whisper the change to the Git Staging bird!
 * No manual save is required to track the new light,
 * The AI's autonomous changes are held in plain sight.
 */

import { State } from '../../../../state.js';
import { FileSystemProvider } from '../../../../fs-provider.js';
import { UI } from '../../../../ui.js';
import { LoopErrorHandler } from '../LoopErrorHandler.js';
import { UIBroadcaster } from './UIBroadcaster.js';
import { ArchitectOfDomains } from './ArchitectOfDomains.js';
import { GitStagingBroadcaster } from './GitStagingBroadcaster.js';

export const BatchExecutor = {
    async execute(compiledChangeArray, parentWorldId, ledgerCallback, iterationProgressSignal) {
        const foundationRef = State.workspaces.find(w => String(w?.id) === String(parentWorldId));
        if (!foundationRef) return new Set();

        const coreType = foundationRef.originalType || foundationRef.type;
        const triggerDirectoryUpdates = new Set();
        
        const uniqueChangesMap = new Map();
        for (const change of compiledChangeArray) {
            uniqueChangesMap.set(change.path, change);
        }
        const consolidatedChanges = Array.from(uniqueChangesMap.values());
        
        const total = consolidatedChanges.length;
        const masterTaskId = `batch-master-${Date.now()}`;
        UI.startTask(masterTaskId, `0% - Initiating Manifestation of ${total} vessels...`);
        let completedCount = 0;

        await Promise.all(consolidatedChanges.map(async (shiftObject) => {
            const fileName = shiftObject.path.split('/').pop();
            const fileTaskId = `file-task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            UI.startTask(fileTaskId, `[${fileName}] - Preparing...`);

            const physicalItem = { 
                ...foundationRef, path: shiftObject.path, kind: 'file', 
                workspaceId: parentWorldId, type: coreType, originalType: coreType
            };

            if (ledgerCallback) await ledgerCallback(physicalItem, shiftObject);

            try {
                if (shiftObject.operation === 'delete') {
                    UI.updateTask(fileTaskId, 50, `[${fileName}] - OS Deletion Request...`);
                    try {
                        await FileSystemProvider.delete(physicalItem);
                    } catch (delErr) {
                        if (delErr.name !== 'NotFoundError' && !delErr.message.includes('NotFoundError')) {
                            throw delErr;
                        }
                    }
                    // B"H - Record the Ayin (Nothingness) in Git
                    await GitStagingBroadcaster.stage(physicalItem, 'delete', null);
                    
                } else {
                    await ArchitectOfDomains.ensureExists(foundationRef, shiftObject.path, coreType);
                    UI.updateTask(fileTaskId, 20, `[${fileName}] - Requesting OS Write...`);
                    await FileSystemProvider.write(physicalItem, shiftObject.content, "B\"H", (perc, msg) => {
                        UI.updateTask(fileTaskId, perc, `[${fileName}] - ${msg}`);
                    });
                    
                    // B"H - Record the Yesh (Existence) in Git
                    await GitStagingBroadcaster.stage(physicalItem, 'write', shiftObject.content);
                }

                const extBar = shiftObject.path.lastIndexOf('/');
                const supPath = extBar <= 0 ? "/" : shiftObject.path.substring(0, extBar);
                triggerDirectoryUpdates.add(supPath);

                if (iterationProgressSignal) iterationProgressSignal(shiftObject, true);
                UIBroadcaster.broadcast(shiftObject, parentWorldId);
                
                UI.endTask(fileTaskId, 'success', `[${fileName}] - Solidified.`);
                
            } catch (errDataBlock) {
                LoopErrorHandler.handle(errDataBlock, shiftObject.path, fileTaskId, iterationProgressSignal, shiftObject);
            }
            
            completedCount++;
            const totalPerc = Math.round((completedCount / total) * 100);
            UI.updateTask(masterTaskId, totalPerc, `${totalPerc}% - Solidified [${completedCount}/${total}]`);
        }));

        UI.endTask(masterTaskId, 'success', `B"H - Solidified ${total} vessels.`);
        return triggerDirectoryUpdates;
    }
};
