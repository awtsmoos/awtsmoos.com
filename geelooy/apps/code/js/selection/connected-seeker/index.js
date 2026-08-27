
// B"H
/**
 * @file index.js
 * @brief The Crown (Keter) of the Connected Seeker.
 * Channels the initial command to the Orchestrator.
 */

import { SeekerOrchestrator } from './orchestrator.js';

export const ConnectedSeeker = {
    /**
     * B"H - Ignites the tracing process starting from the seed vessel.
     * @param {Object} seedItem - The foundational file to branch out from.
     */
    ignite(seedItem) {
        SeekerOrchestrator.seek(seedItem);
    }
};
