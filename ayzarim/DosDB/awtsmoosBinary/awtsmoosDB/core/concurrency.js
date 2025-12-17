
// B"H
const { AsyncLocalStorage } = require('async_hooks');

/**
 * @module ReadWriteLock
 * @description 
 *  Reentrant Read-Write Lock.
 *  Allows multiple concurrent Readers, but only one Exclusive Writer.
 *  Crucially, allows the current Writer AND current Reader to re-enter.
 */
class ReadWriteLock {
    constructor() {
        this.readers = 0;
        this.writeQueue = [];
        this.readQueue = [];
        this.writing = false;
        this.als = new AsyncLocalStorage();
        this.id = Math.floor(Math.random() * 1000);
    }

    log(msg) {
        // console.log(`[Lock ${this.id}] ${msg} | R:${this.readers} W:${this.writing} WQ:${this.writeQueue.length} RQ:${this.readQueue.length}`);
    }

    async runRead(fn) {
        const store = this.als.getStore();
        
        // Reentrancy: If we are the writer, we can read immediately.
        if (store && store.isWriter) {
            return await fn();
        }
        
        // Reentrancy: If we are already a reader, we can read immediately.
        if (store && store.isReader) {
            return await fn();
        }

        // Standard Read Logic
        if (this.writing || this.writeQueue.length > 0) {
            this.log("READ Queued (Waiting for Write)");
            await new Promise(resolve => this.readQueue.push(resolve));
            // When woken, 'readers' has already been incremented by _processQueue
        } else {
            this.readers++;
        }

        this.log("READ Acquired");
        
        // Mark context as Reader
        return this.als.run({ isReader: true }, async () => {
            try {
                return await fn();
            } finally {
                this.readers--;
                this.log("READ Released");
                this._processQueue();
            }
        });
    }

    async runWrite(fn) {
        const store = this.als.getStore();

        // Reentrancy: If we are already the writer, proceed immediately.
        if (store && store.isWriter) {
            this.log("WRITE Re-entered");
            return await fn();
        }

        this.log("Requesting WRITE");
        if (this.writing || this.readers > 0) {
            this.log("WRITE Queued");
            await new Promise(resolve => this.writeQueue.push(resolve));
            // When woken, 'writing' has already been set to true by _processQueue
        } else {
            this.writing = true;
        }

        this.log("WRITE Acquired");
        
        // Run within AsyncLocalStorage context to track ownership
        return this.als.run({ isWriter: true }, async () => {
            try {
                return await fn();
            } finally {
                this.writing = false;
                this.log("WRITE Released");
                this._processQueue();
            }
        });
    }

    _processQueue() {
        // 1. If no one is writing and there are writers waiting, wake one up.
        // (Readers must be 0, or we wait for them to finish)
        if (!this.writing && this.writeQueue.length > 0 && this.readers === 0) {
            this.writing = true;
            this.log("WRITE Acquired (Dequeued)");
            const nextWriter = this.writeQueue.shift();
            nextWriter();
            return;
        }

        // 2. If no one is writing/waiting to write, release ALL waiting readers
        if (!this.writing && this.writeQueue.length === 0 && this.readQueue.length > 0) {
            this.log(`Releasing ${this.readQueue.length} Readers`);
            while(this.readQueue.length > 0) {
                this.readers++;
                const nextReader = this.readQueue.shift();
                nextReader();
            }
        }
    }
}

module.exports = ReadWriteLock;
