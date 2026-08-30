//B"H
// Boruch Hashem
// Blessed is He

/**
 * Shapes durable generation records while the Awtsmoos lets a fleeting network task become remembered local history;
 * Awtsmoos.com keeps record construction and upstream-state translation together, so queue orchestration stays small and mystery-free.
 */
export class GenerationRecord {
	/**
	 * @param {Object} snapshot Provider-neutral generation snapshot.
	 * @param {Object} estimate Pricing estimate.
	 * @returns {Object} Initial durable record saved before submission.
	 */
	static create(snapshot, estimate) {
		const now = Date.now();
		return {
			id: crypto.randomUUID(),
			createdAt: now,
			updatedAt: now,
			...snapshot,
			taskId: null,
			status: 'submitting',
			progress: null,
			videoUrl: '',
			thumbnailUrl: '',
			estimatedCost: estimate.total,
			actualCostIfKnown: null,
			pricingVersion: estimate.version,
			error: null,
			favorite: false,
			tags: [],
			usage: null,
			cachePrompted: false,
			requestSnapshot: snapshot
		};
	}

	/**
	 * @param {Object} generation Existing durable record.
	 * @param {Object} task MiniMax V2 task object.
	 * @returns {Object} Updated record reflecting current upstream state.
	 */
	static fromTask(generation, task) {
		const status = String(
			task.status || generation.status || 'running'
		).toLowerCase();
		return {
			...generation,
			status,
			updatedAt: Date.now(),
			progress: task.progress ?? null,
			videoUrl: task.content?.url || generation.videoUrl || '',
			usage: task.usage || generation.usage || null,
			error: status === 'failed'
				? this.errorMessage(task)
				: null
		};
	}

	/** @param {Object} task MiniMax task object. @returns {string} Human-readable failure. */
	static errorMessage(task) {
		if (typeof task.error === 'string') {
			return task.error;
		}
		return task.error?.message || 'MiniMax generation failed.';
	}
}
