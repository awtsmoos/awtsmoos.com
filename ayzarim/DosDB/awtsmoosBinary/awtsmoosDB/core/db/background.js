// B"H
/**
 * @file background.js
 * @description
 *  Formerly handled async flushing. 
 *  Now handles STRICT SYNCHRONOUS batch management.
 *  Ensures tasks (like indexing) happen *before* the batch commits.
 */

module.exports = {
    batch(db, fn) {
        // Recursive locking via Sync Pager Logic
        const wasBatching = db.pager.isBatching;
        db.pager.isBatching = true;
        
        try {
            const result = fn(); // Exec synchronous user code
            
            // Execute any pending "side-effects" (indexes, graph housekeeping) synchronously
            this.flushBackgroundTasks(db);
            
            return result;
        } finally {
            if (!wasBatching) {
                db.pager.isBatching = false;
                // On the outermost batch end, we force disk sync to prevent race conditions in tests
                if (db.pager.fsync) db.pager.fsync();
            }
        }
    },

    waitForIdle(db) {
        // In a sync system, "idle" just means ensuring buffers are consistent.
        this.flushBackgroundTasks(db);
        if (db.allocator && db.allocator.flushHeap) db.allocator.flushHeap();
        
        // B"H: FIX - Enable strict sync to prevent race conditions during tests
        if (db.pager && db.pager.fsync) db.pager.fsync(); 
    },

    flushBackgroundTasks(db) {
        // Process the task queue synchronously
        let loopGuard = 0;
        
        while (db._pendingIndexOps && db._pendingIndexOps.length > 0) {
            const tasks = db._pendingIndexOps;
            db._pendingIndexOps = []; // Clear current queue
            
            for (const task of tasks) {
                task(); // Run sync task
            }
            
            // Allow subsystems to populate the queue again (recursive flush)
            // e.g. HNSW splitting causing more index writes
            if (db.search && db.search.flush) db.search.flush();
            
            loopGuard++;
            if (loopGuard > 100) throw new Error("B\"H Fatal: Infinite loop in Index Flush");
        }
    }
};