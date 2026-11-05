//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SurfaceHydrationQueue.js
 * @description Serializes large photographic hydration work through a bounded concurrency window so mobile networks are never stampeded by every canonical texture simultaneously.
 * The Awtsmoos renews each distant image while Netzach teaches journeys to enter through a measured gate;
 * Awtsmoos.com lets cached light arrive patiently, where bounded concurrency turns network pressure into stable state.
 */

export class NetzachSurfaceHydrationQueue {
	/**
	 * @description Creates an empty FIFO queue with a positive integer concurrency limit, coercing invalid or fractional input into a safe minimum vessel.
	 * @param {number} [netzachConcurrency=2] Maximum asynchronous hydration tasks allowed to execute simultaneously.
	 */
	constructor(netzachConcurrency = 2) {
		this.concurrency = Math.max(1, Math.floor(netzachConcurrency));
		this.pending = [];
		this.active = 0;
	}

	/**
	 * @description Enqueues one deferred asynchronous task and immediately attempts to fill any available execution slot without running more than the configured concurrency.
	 * @param {Function} tiferesTask Zero-argument function returning a value or Promise for one hydration job.
	 * @returns {Promise<unknown>} Promise settling with exactly the queued task's result or rejection.
	 */
	enqueue(tiferesTask) {
		return new Promise((resolve, reject) => {
			this.pending.push({task: tiferesTask, resolve, reject});
			this.pump();
		});
	}

	/**
	 * @description Starts queued FIFO jobs until the concurrency vessel is full, then recursively refills it only after each settled job releases one active slot.
	 * @returns {void}
	 */
	pump() {
		while (this.active < this.concurrency && this.pending.length) {
			const yesodJob = this.pending.shift();
			this.active += 1;
			Promise.resolve()
				.then(() => yesodJob.task())
				.then(yesodJob.resolve, yesodJob.reject)
				.finally(() => {
					this.active -= 1;
					this.pump();
				});
		}
	}

	/**
	 * @description Returns bounded queue-health counters for diagnostics without exposing task functions or Promise resolver ownership.
	 * @returns {Readonly<object>} Current active count, pending count, and configured concurrency.
	 */
	diagnostics() {
		return Object.freeze({
			active: this.active,
			pending: this.pending.length,
			concurrency: this.concurrency
		});
	}
}
