
// B"H
/**
 * @file LoopEngineController.js
 * @brief Autonomous structural processor bridging textual definitions and physical bytes.
 * 
 * CHAPTER XVIII: THE LAW OF THE SEQUENCE
 * In the realm of Asiyah, parallel expansion can lead to confusion. 
 * If two hands build the same room at once, the stones may clash.
 * This controller now operates in a strict 'Seder' (Sequence),
 * manifesting one vessel at a time to ensure physical stability.
 */
import { State } from '../../../state.js';
import { FileSystemProvider } from '../../../fs-provider.js';
import { Workspaces } from '../../../workspaces/index.js';
import { UI } from '../../../ui.js';
import { VibeDB } from '../../db.js';
import { LoopGitPusher } from './LoopGitPusher.js';
import { LoopErrorHandler } from './LoopErrorHandler.js';
import { GitStagingBroadcaster } from './engine/GitStagingBroadcaster.js';
import { ArchitectOfDomains } from './engine/ArchitectOfDomains.js';

export const LoopEngineController = {
    /**
     * B"H
     * Executes a batch of changes sequentially.
     */
    async executeBatch(compiledChangeArray, parentWorldId, timestreamTokenId = null, blockTimelinePush = false, iterationProgressSignal = null) {
        if (!compiledChangeArray || compiledChangeArray.length === 0) return;

        const foundationRef = State.workspaces.find(ws => String(ws?.id) === String(parentWorldId));
        if (!foundationRef) return;
        
        const coreType = foundationRef.originalType || foundationRef.type;
        const triggerDirectoryUpdates = new Set();
        const activeTimelineLedger = [];
        let volumetricBytesPushed = 0;
        
        // Remove duplicates within the batch, keeping only the latest version of each path
        const uniqueChangesMap = new Map();
        for (const change of compiledChangeArray) {
            uniqueChangesMap.set(change.path, change);
        }
        const consolidatedChanges = Array.from(uniqueChangesMap.values());
        
        const total = consolidatedChanges.length;
        const masterTaskId = `batch-master-${Date.now()}`;
        UI.startTask(masterTaskId, `B"H - Manifesting ${total} changes...`);
        
        let completedCount = 0;

        // B"H - SEQUENTIAL LOOP: This is the critical stabilization fix.
        for (const shiftObject of consolidatedChanges) {
            const fileName = shiftObject.path.split('/').pop();
            const fileTaskId = `file-task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            UI.startTask(fileTaskId, `Preparing ${fileName}...`);

            const physicalItem = { 
                ...foundationRef, 
                path: shiftObject.path, 
                kind: 'file', 
                workspaceId: parentWorldId, 
                type: coreType, 
                originalType: coreType
            };

            // 1. TIMELINE: Record the pre-manifestation state
            if (!blockTimelinePush && timestreamTokenId) {
                let oldContent = null;
                try {
                    const raw = await FileSystemProvider.read(physicalItem);
                    oldContent = (raw instanceof Blob) ? await raw.text() : String(raw);
                } catch(e) { /* File is new */ }
                
                const newContent = shiftObject.operation === 'delete' ? null : shiftObject.content;
                volumetricBytesPushed += newContent ? newContent.length : 0;
                activeTimelineLedger.push({ path: shiftObject.path, operation: shiftObject.operation, oldContent, newContent });
            }

            // 2. ACTION: Engage the OS and engrave the bytes
            try {
                if (shiftObject.operation === 'delete') {
                    UI.updateTask(fileTaskId, 50, `Requesting OS Deletion...`);
                    try {
                        await FileSystemProvider.delete(physicalItem);
                    } catch (delErr) {
                        if (delErr.name !== 'NotFoundError' && !delErr.message.includes('NotFoundError')) throw delErr;
                    }
                    await GitStagingBroadcaster.stage(physicalItem, 'delete', null);
                } else {
                    // Ensure the folder hierarchy exists before writing the leaf
                    await ArchitectOfDomains.ensureExists(foundationRef, shiftObject.path, coreType);
                    
                    UI.updateTask(fileTaskId, 20, `Engraving bytes upon the disk...`);
                    await FileSystemProvider.write(physicalItem, shiftObject.content, "B\"H", (perc, msg) => {
                        UI.updateTask(fileTaskId, perc, `${fileName}: ${msg}`);
                    });
                    
                    await GitStagingBroadcaster.stage(physicalItem, 'write', shiftObject.content);
                }

                // Track which directories need a UI refresh
                const lastSlash = shiftObject.path.lastIndexOf('/');
                const parentPath = lastSlash <= 0 ? "/" : shiftObject.path.substring(0, lastSlash);
                triggerDirectoryUpdates.add(parentPath);

                if (iterationProgressSignal) iterationProgressSignal(shiftObject, true);
                
                // 3. BROADCAST: Update any open editor tabs immediately
                this._broadcastToOpenTabs(shiftObject, parentWorldId);
                
                UI.endTask(fileTaskId, 'success', `Solidified: ${fileName}`);
                
            } catch (err) {
                console.error(`B"H [LoopEngine] Physical failure for ${shiftObject.path}:`, err);
                LoopErrorHandler.handle(err, shiftObject.path, fileTaskId, iterationProgressSignal, shiftObject);
            }
            
            completedCount++;
            const totalPerc = Math.round((completedCount / total) * 100);
            UI.updateTask(masterTaskId, totalPerc, `Solidified [${completedCount}/${total}]`);
        }

        UI.endTask(masterTaskId, 'success', `B"H - Manifestation Process Concluded.`);

        // 4. PERSISTENCE: Save the record of this transformation
        if (!blockTimelinePush && timestreamTokenId && activeTimelineLedger.length > 0) {
            VibeDB.saveTimelineRecord({
                id: String(Date.now()), 
                sessionId: timestreamTokenId,
                workspaceId: parentWorldId, 
                timestamp: Date.now(),
                sizeBytes: volumetricBytesPushed, 
                changes: activeTimelineLedger
            }).catch(()=>{});
        }
        
        // 5. CLOUD: Auto-Commit if the workspace is a GitHub repo
        LoopGitPusher.autoCommit(foundationRef, consolidatedChanges).catch(()=>{});

        // 6. VISION: Refresh the specific folder nodes in the sidebar tree
        for (const coord of triggerDirectoryUpdates) {
            await Workspaces.refreshNode({ ...foundationRef, path: coord, kind: 'directory', workspaceId: parentWorldId, type: coreType }).catch(()=>{});
        }
    },
    
    _broadcastToOpenTabs(change, workspaceId) {
        const tab = State.tabs.find(t => t.item.path === change.path && String(t.item.workspaceId) === String(workspaceId));
        if (tab && change.operation !== 'delete') {
            tab.content = change.content;
            tab.isDirty = false;
            tab.isUncommitted = true;
            if (State.activeTabId === tab.id) {
                import('../../../editor.js').then(({ Editor }) => {
                    if (Editor?.setCurrentContent) Editor.setCurrentContent(change.content);
                });
            }
        }
    }
};
