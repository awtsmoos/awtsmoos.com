// B"H
/**
 * @file LoopEngineController.js
 * @brief Autonomous structural processor bridging textual definitions and physical bytes.
 * RECTIFIED: Restored Honest Progress Bars and Synchronized Visuals. All writes are parallel yet strictly awaited to match reality.
 */
import { State } from '../../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces/index.js';
import { UI } from '../../ui.js';
import { VibeDB } from '../db.js';
import { LoopGitPusher } from './LoopGitPusher.js';
import { LoopErrorHandler } from './LoopErrorHandler.js';

export const LoopEngineController = {
    _establishedStructures: new Set(),
    _buildingLocks: new Map(),

    async executeBatch(compiledChangeArray, parentWorldId, timestreamTokenId = null, blockTimelinePush = false, iterationProgressSignal = null) {
        if (!compiledChangeArray || compiledChangeArray.length === 0) return;

        const foundationRef = State.workspaces.find(vessel => String(vessel?.id) === String(parentWorldId));
        if (!foundationRef) return;
        
        const coreType = foundationRef.originalType || foundationRef.type;
        const triggerDirectoryUpdates = new Set();
        const activeTimelineLedger = [];
        let volumetricBytesPushed = 0;
        
        const total = compiledChangeArray.length;
        const masterTaskId = `batch-master-legacy-${Date.now()}`;
        
        // 1. START MASTER PROGRESS BAR
        UI.startTask(masterTaskId, `0% - Initiating Manifestation [0/${total}]`);
        let completedCount = 0;

        console.log(`[LoopEngine] B"H - Starting parallel awaited manifestation.`);

        // =====================================================================
        // MASSIVE PARALLEL EXECUTION (HONESTLY AWAITED)
        // =====================================================================
        await Promise.all(compiledChangeArray.map(async (shiftObject) => {
            const fileName = shiftObject.path.split('/').pop();
            const fileTaskId = `file-task-legacy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            
            // 2. START MODULAR FILE PROGRESS BAR
            UI.startTask(fileTaskId, `[${fileName}] - Preparing...`);

            const physicalItem = { 
                ...foundationRef, path: shiftObject.path, kind: 'file', 
                workspaceId: parentWorldId, type: coreType, originalType: coreType
            };

            // Timeline Pre-Read (Awaited)
            if (!blockTimelinePush && timestreamTokenId) {
                let oldContent = null;
                const openTab = State.tabs.find(t => t.item.path === shiftObject.path && String(t.item.workspaceId) === String(parentWorldId));
                if (openTab?.content) oldContent = openTab.content;
                else {
                    try {
                        const raw = await FileSystemProvider.read(physicalItem);
                        oldContent = (raw instanceof Blob) ? await raw.text() : String(raw);
                    } catch(e) {}
                }
                
                const newContent = shiftObject.operation === 'delete' ? null : shiftObject.content;
                volumetricBytesPushed += newContent ? newContent.length : 0;
                
                activeTimelineLedger.push({
                    path: shiftObject.path, operation: shiftObject.operation,
                    oldContent, newContent
                });
            }

            // 3. PHYSICAL DISK WRITE (HONEST AWAIT)
            try {
                if (shiftObject.operation === 'delete') {
                    UI.updateTask(fileTaskId, 50, `[${fileName}] - OS Deletion...`);
                    await FileSystemProvider.delete(physicalItem);
                } else {
                    await this._verifyFoundationsPresent(foundationRef, shiftObject.path, coreType);
                    
                    UI.updateTask(fileTaskId, 20, `[${fileName}] - Requesting OS Write...`);
                    
                    // Pass status callback for real-time modular phase updates
                    await FileSystemProvider.write(physicalItem, shiftObject.content, "B\"H", (perc, msg) => {
                        UI.updateTask(fileTaskId, perc, `[${fileName}] - ${msg}`);
                    });
                }

                const extBar = shiftObject.path.lastIndexOf('/');
                const supPath = extBar <= 0 ? "/" : shiftObject.path.substring(0, extBar);
                triggerDirectoryUpdates.add(supPath);

                // 4. SYNC UI VISUALS ONLY UPON SUCCESS
                if (iterationProgressSignal) {
                    iterationProgressSignal(shiftObject, true);
                }
                this._broadcastUIAdjustments(shiftObject, parentWorldId);
                
                UI.endTask(fileTaskId, 'success', `[${fileName}] - Solidified.`);
                
            } catch (errDataBlock) {
                LoopErrorHandler.handle(errDataBlock, shiftObject.path, fileTaskId, iterationProgressSignal, shiftObject);
            }
            
            // 5. UPDATE MASTER PROGRESS BAR
            completedCount++;
            const totalPerc = Math.round((completedCount / total) * 100);
            UI.updateTask(masterTaskId, totalPerc, `${totalPerc}% - Solidified [${completedCount}/${total}]`);
        }));

        UI.endTask(masterTaskId, 'success', `B"H - Manifestation Concluded.`);

        // Background Cleanup
        if (!blockTimelinePush && timestreamTokenId && activeTimelineLedger.length > 0) {
            VibeDB.saveTimelineRecord({
                id: String(Date.now()), sessionId: timestreamTokenId,
                workspaceId: parentWorldId, timestamp: Date.now(),
                sizeBytes: volumetricBytesPushed, changes: activeTimelineLedger
            }).catch(()=>{});
        }
        
        LoopGitPusher.autoCommit(foundationRef, compiledChangeArray).catch(()=>{});

        for (const coordPoint of triggerDirectoryUpdates) {
            await Workspaces.refreshNode({ ...foundationRef, path: coordPoint, kind: 'directory', workspaceId: parentWorldId, type: coreType }).catch(()=>{});
        }
    },
    
    _broadcastUIAdjustments(shiftObjRef, systemWSIDKey) {
        const visualOpenedDocumentRef = State.tabs.find(t => t.item.path === shiftObjRef.path && String(t.item.workspaceId) === String(systemWSIDKey));
        if (visualOpenedDocumentRef && shiftObjRef.operation !== 'delete') {
            visualOpenedDocumentRef.content = shiftObjRef.content;
            visualOpenedDocumentRef.isDirty = false;
            visualOpenedDocumentRef.isUncommitted = true;
            if (State.activeTabId === visualOpenedDocumentRef.id) {
                import('../../editor.js').then(({ Editor }) => {
                    if (Editor && Editor.setCurrentContent) Editor.setCurrentContent(shiftObjRef.content);
                });
            }
        }
    },
    
    async _verifyFoundationsPresent(boundOriginDef, fullTargetFilePathString, originSystemConstraint) {
        const segments = fullTargetFilePathString.split('/').filter(Boolean);
        if (segments.length <= 1) return;
        segments.pop(); 
        
        let pathAccumulatorTarget = "";
        const numericWSLookupIndicatorString = String(boundOriginDef.id);
        
        for (const levelBlockTitle of segments) {
            pathAccumulatorTarget += "/" + levelBlockTitle;
            const matrixKeyStringIDCacheTargetVal = `${numericWSLookupIndicatorString}::${pathAccumulatorTarget}`;
            
            if (this._establishedStructures.has(matrixKeyStringIDCacheTargetVal) || State.domItemMap.has(matrixKeyStringIDCacheTargetVal)) {
                this._establishedStructures.add(matrixKeyStringIDCacheTargetVal);
                continue;
            }

            if (this._buildingLocks.has(matrixKeyStringIDCacheTargetVal)) {
                await this._buildingLocks.get(matrixKeyStringIDCacheTargetVal);
                continue;
            }

            let unlock;
            const lockPromise = new Promise(r => unlock = r);
            this._buildingLocks.set(matrixKeyStringIDCacheTargetVal, lockPromise);
            
            try {
                const parent = { ...boundOriginDef, path: pathAccumulatorTarget.substring(0, pathAccumulatorTarget.lastIndexOf('/')) || "/", kind: 'directory', type: originSystemConstraint };
                await FileSystemProvider.create(parent, levelBlockTitle, 'directory');
                this._establishedStructures.add(matrixKeyStringIDCacheTargetVal);
            } catch (e) {
                this._establishedStructures.add(matrixKeyStringIDCacheTargetVal);
            } finally {
                unlock();
                this._buildingLocks.delete(matrixKeyStringIDCacheTargetVal);
            }
        }
    }
};