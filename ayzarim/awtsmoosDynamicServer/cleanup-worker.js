
/**
 * B"H
 * Awtsmoos Generic Background Task Runner - MODULE
 * This worker is "dumb." It knows nothing about the application's data structures.
 * It simply executes a list of predefined, safe tasks from a job object.
 */

let db; // This will be the shared DB instance from the main server.

/**
 * Executes a single task from a job's task list.
 */
async function executeTask(task) {
    if (!task || !task.operation || !task.params) {
        throw new Error("Malformed task object received by worker.");
    }

    // Adding a small delay can prevent overwhelming the DB during large jobs.
    await new Promise(resolve => setTimeout(resolve, 10)); 
    
    console.log(`  - [Task Runner] Executing: ${task.operation} on path: ${task.params.path}`);

    try {
        switch (task.operation) {
            case 'DELETE_PATH':
                await db.delete(task.params.path);
                break;
            
            case 'DELETE_ENTRY': // Deletes a key from an object at a given path
                await db.deleteEntry(task.params.path, task.params.key);
                break;

            default:
                throw new Error(`Unknown task operation: ${task.operation}`);
        }
    } catch(e) {
        // If the path/entry doesn't exist, it was likely deleted by a previous task.
        // This is not a failure. We can safely ignore it and continue.
        if (!e.message.includes("Path does not exist") && !e.message.includes("Entry not found")) {
            throw e; // Re-throw only for unexpected errors.
        }
    }
}

/**
 * Finds and processes jobs from the generic task queue.
 */
async function processTaskQueue() {
    const queuePath = "/_system/jobs/taskQueue";
    let pendingJobs = {};

    try {
        pendingJobs = await db.get(queuePath) || {};
    } catch (e) {
        if (!e.message.includes("Path does not exist")) console.error("Task Runner: Error fetching queue:", e);
        return;
    }

    const jobEntries = Object.values(pendingJobs);
    const pendingJobCount = jobEntries.filter(j => j.status === 'pending').length;
    if (pendingJobCount > 0) {
        console.log(`Task Runner: Found ${pendingJobCount} pending job(s) to process.`);
    }

    for (const job of jobEntries) {
        if (!job || job.status !== 'pending' || !job.jobId) continue;

        console.log(`\nTask Runner: Processing job: ${job.jobId} (${job.description})`);
        const jobPath = `${queuePath}/${job.jobId}`;
        try {
            await db.write(`${jobPath}/status`, "in-progress");
            await db.write(`${jobPath}/startedAt`, Date.now());

            if (!Array.isArray(job.tasks)) {
                throw new Error("Job is malformed, 'tasks' array is missing.");
            }

            for (const task of job.tasks) {
                await executeTask(task);
            }

            console.log(`Task Runner: Job ${job.jobId} completed successfully.`);
            await db.delete(jobPath);
        } catch (error) {
            console.error(`Task Runner: Job ${job.jobId} FAILED.`, error);
            await db.write(`${jobPath}/status`, "failed");
            await db.write(`${jobPath}/errorMessage`, error.message);
            await db.write(`${jobPath}/failedAt`, Date.now());
        }
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
        setInterval(processTaskQueue, 15000); // Polls every 15 seconds
    }, 5000);
    console.log("Task Runner: Initialized and will start processing in 5 seconds.");
}

module.exports = { startTaskRunner };