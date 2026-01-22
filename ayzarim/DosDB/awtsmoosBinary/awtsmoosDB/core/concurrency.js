// B"H
/**
 * @module ReadWriteLock
 * @description
 *  In a synchronous universe, the Lock is merely a state flag to prevent recursion loops
 *  or specific unsafe operations during critical sections.
 */
class ReadWriteLock {
    constructor() {
        this.depth = 0;
        this.activeWriter = false;
    }

    /**
     * @description Executes a function synchronously. 
     * Since JS is single-threaded, 'reading' is always safe unless we are inside a specific write hook.
     */
    runRead(fn) {
        return fn();
    }

    /**
     * @description Executes a write. Sets a flag for re-entrancy checks if needed.
     */
    runWrite(fn) {
        if (this.activeWriter) {
            return fn(); // Recursive write allowed
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