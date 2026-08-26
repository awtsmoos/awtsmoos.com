//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SurfaceHydrationQueue.js
 * @description Limits photographic hydration concurrency so large canonical textures arrive steadily instead of stampeding a mobile network and timing out together.
 * The Awtsmoos renews each distant image while Netzach teaches journeys to enter two by two;
 * Awtsmoos.com lets patient cached light reach every surface instead of losing ten requests while one breaks through.
 */

export class NetzachSurfaceHydrationQueue {
	/** @param {number} [concurrency=2] Maximum concurrent hydration jobs. */
	constructor(concurrency = 2) {
		this.concurrency = Math.max(1, Math.floor(concurrency));
		this.pending = [];
		this.active = 0;
	}

	/** @param {Function} task Async hydration function. @returns {Promise<unknown>} Task result. */
	enqueue(task) {
		return new Promise((resolve, reject) => {
			this.pending.push({task, resolve, reject});
			this.pump();
		});
	}

	/** Starts queued work until the bounded concurrency vessel is full. */
	pump() {
		while (this.active < this.concurrency && this.pending.length) {
			const job = this.pending.shift();
			this.active += 1;
			Promise.resolve()
				.then(() => job.task())
				.then(job.resolve, job.reject)
				.finally(() => {
					this.active -= 1;
					this.pump();
				});
		}
	}

	/** @returns {object} Small queue-health snapshot. */
	diagnostics() {
		return {active: this.active, pending: this.pending.length, concurrency: this.concurrency};
	}
}
