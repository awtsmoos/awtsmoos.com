/**
 * B"H
 * Awtsmoos Generic Background Task Runner - FINAL ARCHITECTURE
 * Reads an array of job objects from a single queue file, processes them,
 * and clears the queue to prevent reprocessing.
 */

let db; // This will be the shared DB instance from the main server.
const POLLING_INTERVAL_MS = 10000; 

/**
 * Executes a single task from a job's task list.
 */
async function executeTask(task) {
    if (!task || !task.operation || !task.params) {
        throw new Error("Malformed task object received by worker.");
    }

    await new Promise(resolve => setTimeout(resolve, 10)); 
    
    console.log(`  - [Task Runner] Executing: ${task.operation} on path: ${task.params.path}`);

    try {
        switch (task.operation) {
            case 'DELETE_PATH':
                await db.delete(task.params.path);
                break;
            
            case 'DELETE_ENTRY':
                await db.deleteEntry(task.params.path, task.params.key);
                break;

            case 'REMOVE_FROM_ARRAY':
                await db.removeElementFromArray(
                    task.params.path, 
                    task.params.conditions,
                    task.params.options || { deleteSelfIfEmpty: true }
                );
                break;

            default:
                throw new Error(`Unknown task operation: ${task.operation}`);
        }
    } catch(e) {
        if (!e.message.includes("Path does not exist") && e.code !== 'PATH_NOT_FOUND' && !e.message.includes("Entry not found") && !e.message.includes("Array not found") && !e.message.includes("NO_CONDITIONS")) {
            throw e; 
        }
    }
}

/**
 * Finds and processes jobs from the generic task queue file.
 */
async function processTaskQueue() {
    try {
        const queuePath = "/_system/jobs/taskQueue";
        let jobsToProcess = [];

        try {
            // Step 1: Read the entire job queue array.
            const allJobs = await db.get(queuePath); 

            if (Array.isArray(allJobs) && allJobs.length > 0) {
                jobsToProcess = allJobs;

                // Step 2: IMMEDIATELY "claim" the jobs by clearing the queue file.
                await db.write(queuePath, []); 
                console.log(`\nTask Runner: Claimed ${jobsToProcess.length} job(s) from the queue and cleared it.`);
            } else {
                return; // No jobs to process, or queue is not an array.
            }
        } catch (e) {
             if (e.code !== 'ENOENT' && !e.message.includes("Path does not exist") && e.code !== 'PATH_NOT_FOUND') {
                console.error("Task Runner: CRITICAL Error reading the job queue file:", e.stack || e);
            }
            return; // Exit if we can't read the queue (e.g., it doesn't exist yet).
        }

        // Step 3: Process the jobs that we claimed from the queue.
        for (const job of jobsToProcess) {
            if (!job || !job.jobId) {
                console.error("Task Runner: Found a malformed job in queue, skipping.", job);
                continue;
            }

            console.log(`\nTask Runner: Processing claimed job: ${job.jobId} (${job.description})`);
            
            try {
                if (!Array.isArray(job.tasks)) {
                    throw new Error("Job is malformed, 'tasks' array is missing.");
                }

                // Execute all tasks sequentially
                for (const task of job.tasks) {
                    await executeTask(task);
                }

                console.log(`Task Runner: Job ${job.jobId} completed successfully.`);

            } catch (error) {
                // If a job fails, we log it. We don't mark it as failed because it has
                // already been removed from the queue. A more advanced system might
                // move it to a "dead letter queue" for inspection.
                console.error(`Task Runner: Job ${job.jobId} FAILED during processing.`, error.stack || error);
            }
        }
    } catch(masterError) {
        console.error("Task Runner: MASTER CRASH! The polling loop failed unexpectedly:", masterError.stack || masterError);
    }
}

/**
 * The main exported function that starts the worker's polling loop.
 */
function startTaskRunner(databaseInstance) {
    if (!databaseInstance) {
        console.error("Task Runner: CRITICAL - Cannot start without a database instance!");
        return;
    }
    db = databaseInstance;

    console.log("Task Runner: Starting background polling for generic jobs...");
    
    setTimeout(() => {
        processTaskQueue(); 
        setInterval(processTaskQueue, POLLING_INTERVAL_MS);
    }, 100); 

    console.log(`Task Runner: Initialized and will start processing immediately, recurring every ${POLLING_INTERVAL_MS/1000} seconds.`);
}

module.exports = { startTaskRunner };