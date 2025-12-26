// B"H
const { AsyncLocalStorage } = require('async_hooks');

/**
 * @module ReadWriteLock
 * @description 
 *  Synchronous Read-Write Lock facade.
 *  As the database is now strictly synchronous, complex async queueing is banished.
 *  Uses AsyncLocalStorage for reentrancy detection.
 */
class ReadWriteLock {
    constructor() {
        this.als = new AsyncLocalStorage();
    }

    /**
     * @description Executes a function in a synchronous "Read" context.
     */
    runRead(fn) {
        const store = this.als.getStore();
        if (store && (store.isReader || store.isWriter)) {
            return fn();
        }
        return this.als.run({ isReader: true }, () => fn());
    }

    /**
     * @description Executes a function in a synchronous "Write" context.
     */
    runWrite(fn) {
        const store = this.als.getStore();
        if (store && store.isWriter) {
            return fn();
        }
        // B"H: Synchronous logic means we don't wait for other writers,
        // we assume the single-threaded nature of the Node.js process 
        // and the synchronous FS operations protect the boundaries.
        return this.als.run({ isWriter: true }, () => fn());
    }
}

module.exports = ReadWriteLock;