
/**
 * B"H
 * 
 * CHAPTER VI: THE SEAL OF THE SINGULAR LABOR
 * 
 * When many sparks descend together, they often seek the same 
 * foundational room (directory). If two commands strike the 
 * void at once, the physical world (OS) is confused.
 * 
 * This lock ensures that only ONE hand builds a specific 
 * coordinate at a time, keeping the order of creation perfect.
 */

export class VesselCreationLock {
    static locks = new Map();

    /**
     * Acquires a lock for a specific coordinate and executes the task.
     */
    static async acquire(uniqueKey, task) {
        if (this.locks.has(uniqueKey)) {
            await this.locks.get(uniqueKey);
            return;
        }

        let resolveLock;
        const promise = new Promise(res => resolveLock = res);
        this.locks.set(uniqueKey, promise);

        try {
            await task();
        } finally {
            this.locks.delete(uniqueKey);
            resolveLock();
        }
    }
}
