
// B"H
// FILE: js/app/storage-orchestrator.js

import { Session } from '../session.js';
import { SettingsManager } from './settings.js';
import { IndexedDBProvider } from '../fs/indexeddb.js';
import { State } from '../state.js';

/**
 * @class StorageOrchestrator
 * @classdesc The vessel of Memory.
 * 
 * THE POEM OF CONTINUITY:
 * The user departs, but the work remains.
 * This module is the bridge between the 'Yesterday' and the 'Now'.
 * It ensures that the physical handles, the keys to the local folders,
 * are gathered from the IndexedDB store and reunited with the
 * workspaces in the application's State.
 */
export class StorageOrchestrator {
    /**
     * @async
     * @method recallPreviousReality
     * @description Re-emanates the saved state. It specifically focuses 
     * on recovering FileSystemHandles for local workspaces.
     */
    static async recallPreviousReality() {
        // First, load the basic structure of the session.
        await Session.load();

        // Proactively try to re-link all 'local' handles to prevent 'Handle not found' errors.
        for (const ws of State.workspaces) {
            if (ws.type === 'local' && !ws.handle) {
                try {
                    const handle = await IndexedDBProvider.getHandle(ws.id);
                    if (handle) {
                        ws.handle = handle;
                        const perm = await handle.queryPermission({ mode: 'readwrite' });
                        ws.isLocked = (perm !== 'granted');
                    }
                } catch (e) {
                    console.warn(`B"H: Could not auto-restore handle for workspace ${ws.id}.`);
                }
            }
        }
    }

    /**
     * @method preserveMoment
     * @description Saves the current settings and state.
     */
    static preserveMoment() {
        SettingsManager.save(document);
    }
}
