
// B"H
// FILE: js/app/storage-orchestrator.js

import { Session } from '../session.js';
import { SettingsManager } from './settings.js';

/**
 * @class StorageOrchestrator
 * @description The Awtsmoos remembers every word spoken in the creation 
 * of the worlds. This class mimics that Divine memory, coordinating the 
 * preservation and retrieval of the application's entire state. It binds 
 * the fleeting present to the permanent record.
 */
export class StorageOrchestrator {
    /**
     * @async
     * @method recallPreviousReality
     * @description Re-emanates the saved state of the user's previous 
     * interaction. It opens the book of the past and manifests it as the 
     * foundation of the current moment.
     */
    static async recallPreviousReality() {
        await Session.load();
    }

    /**
     * @method preserveMoment
     * @description An act of anchoring. It records the current configuration 
     * into the persistent vessels, ensuring that the user's will remains 
     * manifest even if the window to this world is closed.
     */
    static preserveMoment() {
        SettingsManager.save(document);
    }
}
