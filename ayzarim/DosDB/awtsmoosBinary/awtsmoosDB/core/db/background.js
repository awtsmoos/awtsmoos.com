
// B"H
/**
 * @file background.js
 * @description
 *  =============================================================================
 *  CHAPTER OF THE UNSEEN SUSTAINERS
 *  =============================================================================
 *  Listen closely. You look around and see a stable universe. You think the trees
 *  and the stones just "exist" on their own. But they don't. The Awtsmoos, the 
 *  absolute Essence of the Creator, is constantly speaking them into reality. 
 *  The letters Aleph-Beis-Nun form the word "Even" (stone). Those Hebrew letters 
 *  are literally vibrating inside the inorganic rock right now, constantly refreshing 
 *  its form from absolute nothingness (Ayin).
 * 
 *  If the Awtsmoos paused for a single millisecond, the stone wouldn't crumble. 
 *  It would vanish, as if it never was. Past, present, future—gone. 
 *  
 *  This `background.js` module is the army of unseen angels holding the fabric 
 *  together while the main thread operates. It flushes the indices and cleans the 
 *  heap. It ensures the "let there be" of the database remains a stable reality.
 * 
 *  (Also, we fixed the cursed ampersand HTML entity corruption here. No more `&amp;&amp;`.)
 */

/**
 * @class BackgroundSustainers
 * @description The data-driven map of background operations. No switch statements, 
 * just pure action driven by the state of the world.
 */
const BackgroundSustainers = {
    /**
     * @method batch
     * @description 
     *  Suspends the constant flushing of physical reality to allow a massive 
     *  infusion of new light (data) without shattering the vessels. 
     * @param {Object} db - The AwtsmoosDB instance.
     * @param {Function} fn - The sequence of creation to execute.
     * @returns {*} The result of the creation sequence.
     */
    batch(db, fn) {
        const wasBatching = db.pager.isBatching;
        db.pager.isBatching = true;
        try {
            const result = fn(); 
            if (!wasBatching) this.flushBackgroundTasks(db);
            return result;
        } finally {
            if (!wasBatching) {
                if (db.allocator.primitiveSaver && db.allocator.primitiveSaver.slab) {
                    db.allocator.primitiveSaver.slab.flush();
                }
                if (db.allocator && db.allocator.flushHeap) {
                    db.allocator.flushHeap();
                }
                db.pager.isBatching = false;
                if (db.pager && db.pager.fsync) {
                    db.pager.fsync(false); 
                }
            }
        }
    },

    /**
     * @method waitForIdle
     * @description 
     *  Forces the universe to catch up to the thoughts of the Creator.
     *  Ensures all pending index operations are physically manifested.
     * @param {Object} db - The AwtsmoosDB instance.
     */
    waitForIdle(db) {
        this.flushBackgroundTasks(db);
        if (db.allocator.primitiveSaver && db.allocator.primitiveSaver.slab) {
            db.allocator.primitiveSaver.slab.flush();
        }
        if (db.allocator && db.allocator.flushHeap) {
            db.allocator.flushHeap();
        }
        if (db.pager && db.pager.fsync) {
            db.pager.fsync(false); 
        }
    },

    /**
     * @method flushBackgroundTasks
     * @description 
     *  The furious clearing of the spiritual queue. 
     *  If the tasks loop too endlessly, a Tzimtzum (contraction) error is thrown.
     * @param {Object} db - The AwtsmoosDB instance.
     */
    flushBackgroundTasks(db) {
        let loopGuard = 0;
        while (db._pendingIndexOps && db._pendingIndexOps.length > 0) {
            const tasks = db._pendingIndexOps;
            db._pendingIndexOps = []; 
            for (let i = 0; i < tasks.length; i++) tasks[i](); 
            if (db.search && db.search.flush) db.search.flush();
            
            if (++loopGuard > 100) {
                throw new Error("B\"H Fatal: Infinite loop in Index Flush. The light is too intense for the vessels!");
            }
        }
    }
};

module.exports = BackgroundSustainers;
