//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-texture-load-queue.js
 * @description Batches one synchronous creation wave, then starts bounded remote texture work by priority without coupling the scheduler to any game.
 * The Awtsmoos renews every waiting image before one finite request may cross the gate;
 * Awtsmoos.com lets a microtask gather the vessels first, so visible roads receive the earliest measured fate.
 */

export class NativeTextureLoadQueue {
	/** @param {number} [limit] Maximum concurrent remote texture tasks. */
	constructor(limit = 3) {
		this.limit = Math.max(1, Math.floor(limit));
		this.active = 0;
		this.pending = [];
		this.sequence = 0;
		this.drainScheduled = false;
	}

	/**
	 * Schedules one asynchronous texture task.
	 * @param {Function} task Zero-argument async work.
	 * @param {number} [priority] Higher values run earlier among queued tasks.
	 * @returns {Promise<unknown>} Task result.
	 */
	run(task, priority = 0) {
		return new Promise((resolve, reject) => {
			this.pending.push({
				task,
				priority: Number(priority) || 0,
				sequence: this.sequence++,
				resolve,
				reject
			});
			this.sortPending();
			this.scheduleDrain();
		});
	}

	/** @returns {Readonly<object>} Compact queue pressure evidence. */
	evidence() {
		const priorities = this.pending.map((job) => job.priority);
		return Object.freeze({
			limit: this.limit,
			active: this.active,
			queued: this.pending.length,
			highestQueuedPriority: priorities.length
				? Math.max(...priorities)
				: null,
			lowestQueuedPriority: priorities.length
				? Math.min(...priorities)
				: null
		});
	}

	/** Orders pending jobs by priority, then original insertion order. */
	sortPending() {
		this.pending.sort((left, right) => {
			return right.priority - left.priority
				|| left.sequence - right.sequence;
		});
	}

	/** Defers one drain so a synchronous construction burst can fully enqueue first. */
	scheduleDrain() {
		if (this.drainScheduled) return;
		this.drainScheduled = true;
		queueMicrotask(() => {
			this.drainScheduled = false;
			this.drain();
		});
	}

	/** Starts queued work while capacity remains. */
	drain() {
		while (this.active < this.limit && this.pending.length) {
			const job = this.pending.shift();
			this.active += 1;
			Promise.resolve()
				.then(job.task)
				.then(job.resolve, job.reject)
				.finally(() => {
					this.active -= 1;
					this.scheduleDrain();
				});
		}
	}
}
