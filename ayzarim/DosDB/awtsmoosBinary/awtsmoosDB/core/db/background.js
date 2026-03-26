
// B"H
/**
 * @file background.js
 * @description
 *  The Scribe of the Hidden Ripples.
 *  
 *  THE TIKKUN OF FINALITY:
 *  When a batch concludes, we must first command the Heap to commit its 
 *  ephemeral strings into the Pager's journal. Only THEN can we command 
 *  the Pager to perform its Great Inscription from that now-complete journal.
 *  This two-step finalization ensures a complete, unified reality is persisted.
 */

module.exports = {
    batch(db, fn) {
        const wasBatching = db.pager.isBatching;
        db.pager.isBatching = true;
        
        try {
            const result = fn(); 
            
            // Only flush tasks if we are the outermost layer of the batch
            if (!wasBatching) {
                this.flushBackgroundTasks(db);
            }
            return result;
        } finally {
            if (!wasBatching) {
                // B"H: The Tikkun of Finality.
                // 1. First, command the Heap to write its ephemeral memory 
                //    (like strings) into the Pager's in-memory Journal.
                if (db.allocator && db.allocator.flushHeap) {
                    db.allocator.flushHeap();
                }
                
                // 2. NOW, command the Pager to take its complete Journal
                //    and perform the Great Inscription to the physical disk.
                db.pager.isBatching = false;
                if (db.pager && db.pager.fsync) {
                    db.pager.fsync(false); 
                }
            }
        }
    },

    waitForIdle(db) {
        this.flushBackgroundTasks(db);
        if (db.allocator && db.allocator.flushHeap) db.allocator.flushHeap();
        if (db.pager && db.pager.fsync) db.pager.fsync(false); 
    },

    flushBackgroundTasks(db) {
        let loopGuard = 0;
        
        while (db._pendingIndexOps && db._pendingIndexOps.length > 0) {
            const tasks = db._pendingIndexOps;
            db._pendingIndexOps = []; 
            
            for (let i = 0; i < tasks.length; i++) {
                tasks[i](); 
            }
            
            if (db.search && db.search.flush) db.search.flush();
            
            loopGuard++;
            if (loopGuard > 100) throw new Error("B\"H Fatal: Infinite loop in Index Flush");
        }
    }
};
