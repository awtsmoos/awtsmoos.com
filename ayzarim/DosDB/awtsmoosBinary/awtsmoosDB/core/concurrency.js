// B"H
/**
 * @module Semaphore
 * @description Controls the flow of concurrent requests to prevent V8 Heap Exhaustion.
 * Acts as a dam: only lets `maxConcurrency` promises execute at once.
 */
class Semaphore {
    constructor(maxConcurrency) {
        this.queue = [];
        this.permits = maxConcurrency;
    }

    /**
     * Waits until a permit is available.
     * @returns {Promise<void>}
     */
    async acquire() {
        if (this.permits > 0) {
            this.permits--;
            return Promise.resolve();
        }
        return new Promise(resolve => this.queue.push(resolve));
    }

    /**
     * Releases a permit, allowing the next task in the queue to run.
     */
    release() {
        this.permits++;
        if (this.queue.length > 0 && this.permits > 0) {
            this.permits--;
            const nextResolver = this.queue.shift();
            nextResolver();
        }
    }
}

module.exports = Semaphore;