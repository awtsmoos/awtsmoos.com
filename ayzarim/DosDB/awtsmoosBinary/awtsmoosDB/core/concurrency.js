
// B"H
/**
 * @file core/concurrency.js
 * @chapter The Singularity of Will
 * @description
 * In a synchronous universe, there is no waiting. But there is still order.
 * This lock provides the barrier necessary to prevent recursion loops
 * or fragmented writes without using a single Promise.
 * 
 * It is a pure, atomic mechanism that ensures the database acts with 
 * a single, unified Will.
 */

class ReadWriteLock {
    constructor() {
        this.activeWriter = false;
    }

    /**
     * @method runRead
     * @description Immediate invocation. Sight is always granted.
     */
    runRead(fn) {
        // Sight needs no barrier in the presence of the RAM mirror.
        return fn();
    }

    /**
     * @method runWrite
     * @description Immediate, order-guaranteed execution.
     */
    runWrite(fn) {
        if (this.activeWriter) {
            // Sub-rituals are permitted within a primary sequence.
            return fn(); 
        }
        
        this.activeWriter = true;
        try {
            return fn();
        } finally {
            this.activeWriter = false;
        }
    }
}

module.exports = ReadWriteLock;
