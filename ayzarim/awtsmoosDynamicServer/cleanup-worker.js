
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

module.exports = { startTaskRunner };```

---

### **Phase 2: Rewrite the `deleteSeries` Method as a High-Performance Job Compiler**

This is the core of the solution. We will create a fast, parallel compiler that generates the "recipe" for our dumb worker without timing out.

*   **File to Edit:** `/Remember/awtsmoos.com/geelooy/api/social/helper/series.js`
*   **Action:**
    1.  We will keep the `getAllDescendantIds` helper as is.
    2.  We will add a **new, performance-oriented helper** called `compileTasksForSingleSeries`.
    3.  We will **REPLACE** the `deleteSeriesFromHeichel` function with the final, optimized version that uses `Promise.all`.

```javascript
// In /Remember/awtsmoos.com/geelooy/api/social/helper/series.js

// ... (keep all existing require statements and path helpers at the top)

// HELPER 1: This function is still needed and does not change.
async function getAllDescendantIds({ $i, heichelId, seriesId }) { /* ... same as before ... */ }

// ADD THIS NEW, PERFORMANCE-ORIENTED HELPER
/**
 * Compiles deletion tasks for ONE series. This function is designed to be
 * called in parallel by Promise.all().
 * @returns {Promise<Array<object>>} A promise that resolves to an array of task objects.
 */
async function compileTasksForSingleSeries({ $i, heichelId, seriesId }) {
    const tasks = [];
    
    // Fetch the two pieces of data we need for this series concurrently
    const [postsObject, seriesPrateem] = await Promise.all([
        $i.db.get(seriesPostsPath(heichelId, seriesId)).catch(() => null),
        $i.db.get(seriesPrateemPath(heichelId, seriesId)).catch(() => null)
    ]);

    // Compile tasks for Posts and Comments within this series
    if (postsObject && typeof postsObject === 'object') {
        for (const [postId, postData] of Object.entries(postsObject)) {
            if (postData?.author) {
                // Task: Untrack Post from author's alias
                // Note: For simplicity, we use a direct path. A more complex system might
                // require another read to get the full breadcrumb for the post tracking path.
                const postTrackingPath = `${sp}/aliases/${postData.author}/postsMade/inHeichel/${heichelId}/series/${seriesId}`;
                tasks.push({
                    operation: 'DELETE_ENTRY',
                    params: { path: postTrackingPath, key: postId }
                });
            }
            // Task: Delete the entire comment block for this post.
            // This is efficient and avoids reading all comments.
            tasks.push({
                operation: 'DELETE_PATH',
                params: { path: commentsBasePath(heichelId, seriesId, postId) }
            });
        }
    }
    
    // Compile task for untracking the Series itself
    if (seriesPrateem?.author) {
        tasks.push({
            operation: 'DELETE_ENTRY',
            params: { 
                path: aliasSeriesTrackingPath(seriesPrateem.author, heichelId),
                key: seriesId
            }
        });
    }

    // Compile final task: delete the main series path itself
    tasks.push({
        operation: 'DELETE_PATH',
        params: { path: seriesBasePath(heichelId, seriesId) }
    });

    return tasks;
}


// REPLACE the existing deleteSeriesFromHeichel function with this FINAL version
async function deleteSeriesFromHeichel({ $i, heichelId, seriesId, userid }) {
    const aliasId = $i.$_POST.aliasId;
    if (!aliasId) return er({ code: "MISSING_PARAMS", details: "Requires aliasId" });
    if (seriesId === "root") return er({ code: "CANNOT_DELETE_ROOT" });

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });

    let parentSeriesId;
    try {
        parentSeriesId = (await $i.db.get(seriesPrateemPath(heichelId, seriesId), { propertyMap: { parentSeriesId: true } }))?.parentSeriesId;
    } catch (e) { /* Handle cases where series might already be gone below */ }

    // 1. Get the full list of series to process. This is the only sequential part.
    const allSeriesIds = await getAllDescendantIds({ $i, heichelId, seriesId });
    if (allSeriesIds.length === 0) {
        return { success: { message: "Series not found, nothing to schedule." } };
    }

    // 2. THE CORE PERFORMANCE IMPROVEMENT:
    // Create an array of promises, where each promise compiles tasks for one series.
    const taskCompilationPromises = allSeriesIds.map(id => 
        compileTasksForSingleSeries({ $i, heichelId, seriesId: id })
    );

    // Execute all database reads in parallel. This is extremely fast.
    const nestedTasks = await Promise.all(taskCompilationPromises);
    const finalTaskList = nestedTasks.flat(); // Flatten the array of arrays into one big list.

    // 3. Create the generic job object with the compiled task list.
    const jobId = `series-delete-${seriesId}-${Date.now()}`;
    const jobRecord = {
        jobId: jobId,
        status: "pending",
        description: `Delete series ${seriesId} and its ${allSeriesIds.length - 1} sub-series`,
        tasks: finalTaskList,
        createdAt: Date.now(),
        requestedBy: aliasId
    };

    // 4. Persist the job to the generic task queue.
    const jobPath = `/_system/jobs/taskQueue/${jobId}`;
    await $i.db.write(jobPath, jobRecord);

    // 5. Perform the fast, user-facing unlink action.
    if (parentSeriesId) {
        try {
            await $i.db.removeElementFromArray(seriesSubSeriesPath(heichelId, parentSeriesId), { exact: { selfEquals: seriesId } });
        } catch (e) {
            await $i.db.delete(jobPath).catch(err => console.error("Rollback of task job failed:", err));
            return er({ code: "PARENT_REMOVAL_FAILED", details: e.message });
        }
    }

    return { 
        success: { 
            message: "Series has been unlinked and a cleanup job has been scheduled.",
            jobId: jobId 
        } 
    };
}