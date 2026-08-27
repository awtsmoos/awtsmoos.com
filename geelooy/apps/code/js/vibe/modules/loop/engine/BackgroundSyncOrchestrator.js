
// B"H
/**
 * @file BackgroundSyncOrchestrator.js
 * @brief THE SILENT SCRIBE OF THE CLOUD.
 * 
 * THE POEM OF THE DECOUPLED DEED:
 * The earth must receive the seed instantly, though the news of the planting
 * travels slowly to the distant king. We perform the local write with the 
 * speed of thought, and cast the cloud synchronization into the background 
 * where it may take its time without hindering the Creator's hand.
 */

import { GitCloudScribe } from '../sync/GitCloudScribe.js';

export const BackgroundSyncOrchestrator = {
    /**
     * @function dispatch
     * @description Fires off a cloud synchronization ritual without awaiting its completion.
     */
    dispatch(workspace, changes) {
        if (!workspace || workspace.type !== 'github') return;

        console.log(`[BgSync] B"H - Dispatching background sync for ${workspace.name}`);
        
        // B"H - The key is NOT using 'await' here.
        // We let the promise run in its own spiritual thread.
        GitCloudScribe.push(workspace, changes).then(success => {
            if (success) {
                console.log(`[BgSync] B"H - Background Cloud Manifestation complete.`);
            }
        }).catch(err => {
            console.warn(`[BgSync] B"H - Background Cloud Sync encountered a hurdle:`, err);
        });
    }
};
