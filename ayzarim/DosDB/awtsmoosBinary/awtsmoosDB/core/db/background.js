//B"H

/**
 * @file background.js
 * @description
 *  Manages strictly synchronous batch boundaries and background task flushing.
 */

module.exports = {
    /**
     * @description Executes a function within a synchronous batch boundary.
     */
    batch(db, fn) {
        return db.lock.runWrite(() => {
            const isNested = db.pager.isBatching;
            if (!isNested) db.pager.startBatch ? db.pager.startBatch() : null;
            try { return fn(); } finally {
                if (!isNested) {
                    this.flushBackgroundTasks(db);
                    if (db.allocator) db.allocator.flushHeap();
                    db.pager.endBatch ? db.pager.endBatch() : null;
                }
            }
        });
    },

    /**
     * @description Synchronously syncs all pending data to physical storage.
     */
    waitForIdle(db) {
        return db.lock.runWrite(() => {
            this.flushBackgroundTasks(db);
            if (db.allocator) {
                db.allocator.flushHeap();
                db.allocator.v1.flush(); 
            }
            db.pager.fsync ? db.pager.fsync() : null;
        });
    },

    /**
     * @description Processes the queue of pending indexing and system operations immediately.
     */
    flushBackgroundTasks(db) {
        if (db._isFlushing) return;
        db._isFlushing = true;
        try {
            while (db._pendingIndexOps.length > 0) {
                const tasks = db._pendingIndexOps;
                db._pendingIndexOps = [];
                for (const task of tasks) task();
            }
            if (db.search && db.search.flush) db.search.flush();
            if (db._pendingIndexOps.length > 0) this.flushBackgroundTasks(db);
        } finally {
            db._isFlushing = false;
        }
    }
};