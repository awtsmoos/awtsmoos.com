//B"H

/**
 * @file background.js
 * @description
 *  Manages asynchronous background tasks, indexing updates, and batch write atomicity.
 */

module.exports = {
    /**
     * @description Executes a function within a batch boundary, ensuring background tasks are flushed at the end.
     */
    batch: async (db, fn) => {
        return db.lock.runWrite(async () => {
            const isNested = db.pager.isBatching;
            if (!isNested) db.pager.startBatch();
            try { return await fn(); } finally {
                if (!isNested) {
                    await db._flushBackgroundTasks();
                    if (db.allocator) await db.allocator.flushHeap();
                    await db.pager.endBatch();
                }
            }
        });
    },

    /**
     * @description Awaits all pending background operations and syncs to physical storage.
     */
    waitForIdle: async (db) => {
        return db.lock.runWrite(async () => {
            await db._flushBackgroundTasks();
            if (db.allocator) {
                await db.allocator.flushHeap();
                await db.allocator.v1.flush(); 
            }
            await db.pager.sync();
        });
    },

    /**
     * @description Processes the queue of pending indexing and system operations.
     */
    flushBackgroundTasks: async (db) => {
        if (db._isFlushing) return;
        db._isFlushing = true;
        try {
            while (db._pendingIndexOps.length > 0) {
                const tasks = db._pendingIndexOps;
                db._pendingIndexOps = [];
                for (const task of tasks) await task();
            }
            await db.search.flush();
            if (db._pendingIndexOps.length > 0) await db._flushBackgroundTasks();
        } finally {
            db._isFlushing = false;
        }
    }
};