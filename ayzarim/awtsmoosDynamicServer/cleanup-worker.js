
/**
 * B"H
 * Awtsmoos Background Cleanup Worker - MODULE
 * This script exports a function that starts the cleanup process.
 * It is designed to be called by the main server process after the DB is initialized.
 */

const path = require('path');

// --- Global variables that will be set by the start function ---
let db; 
const sp = "/social"; // Assuming this is your social path prefix
const seriesBasePath = (h, s) => `${sp}/heichelos/${h}/series/${s}`;
const seriesPostsPath = (h, s) => `${sp}/heichelos/${h}/series/${s}/posts`;
const commentsBasePath = (h, s, p) => `${sp}/heichelos/${h}/series/${s}/posts/${p}/comments`;


/**
 * Deletes all data for a single series ID.
 */
async function deleteSeriesData(heichelId, seriesId) {
    try {
        const postsPath = seriesPostsPath(heichelId, seriesId);
        const postIds = await db.getObjectKeys(postsPath);

        if (Array.isArray(postIds)) {
            for (const postId of postIds) {
                const postCommentsPath = commentsBasePath(heichelId, seriesId, postId);
                await db.delete(postCommentsPath);
            }
        }
        
        const pathToDelete = seriesBasePath(heichelId, seriesId);
        await db.delete(pathToDelete);
        console.log(`  - Successfully deleted all data for series: ${seriesId}`);
    } catch (e) {
        if (e.message.includes("Path does not exist")) {
            console.log(`  - Series ${seriesId} already deleted. Skipping.`);
        } else {
            console.error(`  - FAILED to delete series ${seriesId}:`, e.message);
            throw e; 
        }
    }
}

/**
 * Finds and processes jobs from the cleanup queue.
 */
async function processCleanupQueue() {
    const queuePath = "/_system/jobs/seriesCleanupQueue";
    let pendingJobs = {};

    try {
        pendingJobs = await db.get(queuePath) || {};
    } catch (e) {
        if (!e.message.includes("Path does not exist")) {
            console.error("Cleanup Worker: Error fetching cleanup queue:", e);
        }
        return; // Wait for the next interval
    }

    const jobEntries = Object.entries(pendingJobs);
    if (jobEntries.length === 0) {
        // This is the check you requested. If no jobs, it just returns.
        return;
    }
    
    console.log(`Cleanup Worker: Found ${jobEntries.length} job(s) in queue. Checking for 'pending'...`);

    for (const [jobId, job] of jobEntries) {
        if (job.status !== 'pending') continue;

        console.log(`\nCleanup Worker: Processing cleanup job: ${jobId}`);
        try {
            await db.write(`${queuePath}/${jobId}/status`, "in-progress");
            await db.write(`${queuePath}/${jobId}/startedAt`, Date.now());
            
            for (const seriesId of job.idsToDelete) {
                await deleteSeriesData(job.heichelId, seriesId);
            }

            console.log(`Cleanup Worker: Job ${jobId} completed successfully.`);
            await db.delete(`${queuePath}/${jobId}`);
        } catch (error) {
            console.error(`Cleanup Worker: Job ${jobId} FAILED. Please inspect manually.`, error);
            await db.write(`${queuePath}/${jobId}/status`, "failed");
            await db.write(`${queuePath}/${jobId}/errorMessage`, error.message);
        }
    }
}

/**
 * The main exported function that starts the worker's polling loop.
 * @param {object} databaseInstance - The initialized DosDB instance from the main server.
 */
function startCleanupWorker(databaseInstance) {
    if (!databaseInstance) {
        console.error("Cleanup Worker: Cannot start without a database instance!");
        return;
    }
    db = databaseInstance; // Set the shared database instance

    console.log("Cleanup Worker: Starting background polling for cleanup jobs...");
    
    // Run the processor once immediately on start, then every 30 seconds.
    processCleanupQueue();
    setInterval(processCleanupQueue, 30000); // Polls every 30 seconds
    
    console.log("Cleanup Worker: Initialized and now running in the background.");
}

module.exports = { startCleanupWorker };