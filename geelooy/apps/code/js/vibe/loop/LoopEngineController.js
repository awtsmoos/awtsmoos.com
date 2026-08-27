
/**
 * @file LoopEngineController.js
 * @brief Solidifying the Word into physical bytes sequentially.
 */
import { State } from '../../state.js';
import { FileSystemProvider } from '../../fs-provider.js';
import { Workspaces } from '../../workspaces/index.js';
import { UI } from '../../ui.js';
import { LoopErrorHandler } from './LoopErrorHandler.js';
import { ArchitectOfDomains } from './engine/ArchitectOfDomains.js';
import { UIBroadcaster } from './engine/UIBroadcaster.js';
import { GitStagingBroadcaster } from './engine/GitStagingBroadcaster.js';

export const LoopEngineController = {
    async executeBatch(compiledChanges, parentWorldId, sessionId = null, skipTimeline = false, onProgress = null) {
        if (!compiledChanges || compiledChanges.length === 0) return;

        const ws = State.workspaces.find(w => String(w?.id) === String(parentWorldId));
        if (!ws) return;
        
        const type = ws.originalType || ws.type;
        const total = compiledChanges.length;
        const masterTaskId = `batch-exec-${Date.now()}`;
        UI.startTask(masterTaskId, `B"H - Processing ${total} changes...`);

        // B"H - SEQUENTIAL EXECUTION (The Law of Seder)
        // We process one by one to avoid OS race conditions and TypeMismatch crashes.
        let i = 0;
        for (const change of compiledChanges) {
            i++;
            const fileName = change.path.split('/').pop();
            const fileTaskId = `file-${i}-${Date.now()}`;
            UI.startTask(fileTaskId, `Manifesting ${fileName}...`);

            const item = { 
                ...ws, path: change.path, kind: 'file', 
                workspaceId: parentWorldId, type, originalType: type
            };

            try {
                console.log(`[LoopEngine] B"H - Processing: ${change.operation.toUpperCase()} ${change.path}`);

                if (change.operation === 'delete') {
                    await FileSystemProvider.delete(item).catch(() => {});
                    await GitStagingBroadcaster.stage(item, 'delete', null);
                } else {
                    // 1. Guard against writing a file where a directory exists
                    const isDir = await this._isActuallyDirectory(ws, change.path);
                    if (isDir) {
                        console.warn(`[LoopEngine] B"H - Type Conflict! ${change.path} is a Directory. Skipping.`);
                        UI.endTask(fileTaskId, 'info', `Skipped: Path is Directory.`);
                        continue;
                    }

                    // 2. Build the domain
                    await ArchitectOfDomains.ensureExists(ws, change.path, type);
                    
                    // 3. Write the light
                    await FileSystemProvider.write(item, change.content, "B\"H", (p, m) => {
                        UI.updateTask(fileTaskId, p, `${fileName}: ${m}`);
                    });
                    
                    await GitStagingBroadcaster.stage(item, 'write', change.content);
                }

                if (onProgress) onProgress(change, true);
                UIBroadcaster.broadcast(change, parentWorldId);
                UI.endTask(fileTaskId, 'success', `[Solidified] ${fileName}`);
                
            } catch (err) {
                console.error(`[LoopEngine] B"H - Failed ${change.path}:`, err);
                LoopErrorHandler.handle(err, change.path, fileTaskId, onProgress, change);
            }
        }

        UI.endTask(masterTaskId, 'success', `B"H - All operations concluded.`);
        setTimeout(() => Workspaces.render(), 100);
    },

    async _isActuallyDirectory(workspace, path) {
        try {
            const check = { ...workspace, path, kind: 'directory' };
            const res = await FileSystemProvider.list(check);
            return !!(res && res.entries);
        } catch (e) { return false; }
    }
};
