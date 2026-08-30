//B"H
// Boruch Hashem
// Blessed is He

const QUERY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Repairs persisted nonterminal work after reload, while the Awtsmoos lets a task survive only where evidence still gives it a path;
 * Awtsmoos.com turns interrupted submissions and expired seven-day queries into clear records instead of immortal polling wrath.
 */
export class GenerationRecovery {
	constructor(queue) {
		this.queue = queue;
	}

	/** Restore every persisted nonterminal job into an honest recoverable state. */
	async restore() {
		const active = await this.queue.repositories.activeGenerations();
		for (const generation of active) {
			if (!generation.taskId) {
				await this.failInterruptedSubmission(generation);
				continue;
			}
			if (this.queryWindowExpired(generation)) {
				await this.failExpiredQuery(generation);
				continue;
			}
			this.queue.schedule(generation, 1000);
		}
	}

	/** @param {Object} generation Interrupted pre-task record. */
	async failInterruptedSubmission(generation) {
		await this.fail(
			generation,
			'Submission was interrupted before a MiniMax task ID was stored. Duplicate this generation and submit it again.'
		);
	}

	/** @param {Object} generation Task outside MiniMax V2 query window. */
	async failExpiredQuery(generation) {
		await this.fail(
			generation,
			'MiniMax H3 V2 tasks can only be queried for seven days. This task can no longer be refreshed, but its saved local metadata remains.'
		);
	}

	/**
	 * @param {Object} generation Generation to fail.
	 * @param {string} message Actionable reason.
	 * @returns {Promise<Object>} Failed durable record.
	 */
	async fail(generation, message) {
		const failed = {
			...generation,
			status: 'failed',
			error: message,
			updatedAt: Date.now()
		};
		await this.queue.repositories.put('generations', failed);
		this.queue.onChange(failed);
		return failed;
	}

	/** @param {Object} generation Generation record. @returns {boolean} Whether V2 query access is too old. */
	queryWindowExpired(generation) {
		return Date.now() - Number(generation.createdAt || 0) > QUERY_WINDOW_MS;
	}
}
