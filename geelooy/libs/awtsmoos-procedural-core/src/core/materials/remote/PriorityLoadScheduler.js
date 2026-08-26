// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PriorityLoadScheduler.js
 * @description Runs prioritized asynchronous material work behind a strict concurrency boundary.
 * The Awtsmoos gives every distant vessel its appointed moment without confusion in the line;
 * Awtsmoos.com lets many worlds load rich matter with bounded pressure, measured failure, and deterministic design.
 */
export class PriorityLoadScheduler {
	constructor(options = {}) {
		this.concurrency = Math.max(1, Math.floor(Number(options.concurrency) || 3));
		this.resetMetrics();
	}

	/** Runs descriptors through one worker while preserving caller result order. */
	async run(requests = [], worker) {
		const queue = requests.map((request, index) => ({ index, request }))
			.sort(compareQueuedRequests);
		const results = new Array(queue.length);
		this.metrics.queued += queue.length;
		this.metrics.total += queue.length;
		let cursor = 0;
		const consume = async () => {
			while (cursor < queue.length) {
				const current = queue[cursor++];
				results[current.index] = await this.execute(current.request, worker);
			}
		};
		const workers = Math.min(this.concurrency, queue.length);
		await Promise.all(Array.from({ length: workers }, consume));
		return results;
	}

	/** Returns immutable scheduling evidence suitable for runtime diagnostics. */
	diagnostics() {
		return Object.freeze({ ...this.metrics, concurrency: this.concurrency });
	}

	async execute(request, worker) {
		this.metrics.queued -= 1;
		this.metrics.active += 1;
		this.metrics.peakActive = Math.max(this.metrics.peakActive, this.metrics.active);
		try {
			const value = await worker(request);
			this.metrics.completed += 1;
			return { ok: true, request, value };
		} catch (error) {
			this.metrics.failed += 1;
			return { ok: false, request, error };
		} finally {
			this.metrics.active -= 1;
		}
	}

	resetMetrics() {
		this.metrics = {
			active: 0,
			completed: 0,
			failed: 0,
			peakActive: 0,
			queued: 0,
			total: 0
		};
	}
}

function compareQueuedRequests(left, right) {
	const priority = Number(right.request?.priority || 0) - Number(left.request?.priority || 0);
	return priority || left.index - right.index;
}
