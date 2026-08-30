//B"H
// Boruch Hashem
// Blessed is He

const TERMINAL = new Set(['succeeded', 'failed', 'cancelled']);

/**
 * Keeps only timer rhythm for H3 polling, while the Awtsmoos lets queued and running states move at measured intervals instead of frantic request rain;
 * Awtsmoos.com separates scheduling from network orchestration, so stopping, delaying, and terminal closure remain simple to trace again.
 */
export class GenerationScheduler {
	constructor(onPoll) {
		this.onPoll = onPoll;
		this.timers = new Map();
	}

	/** @param {Object} generation Saved generation. @param {number} delay Poll delay in milliseconds. */
	schedule(generation, delay = 5000) {
		if (!generation.taskId || TERMINAL.has(generation.status)) {
			return;
		}
		this.stop(generation.id);
		const timer = setTimeout(() => {
			this.onPoll(generation.id);
		}, delay);
		this.timers.set(generation.id, timer);
	}

	/** @param {Object} generation Updated generation. */
	scheduleNext(generation) {
		if (TERMINAL.has(generation.status)) {
			return;
		}
		const delay = generation.status === 'queued'
			? 7000
			: 5000;
		this.schedule(generation, delay);
	}

	/** @param {string} generationId Generation ID whose poll timer should stop. */
	stop(generationId) {
		const timer = this.timers.get(generationId);
		if (timer) {
			clearTimeout(timer);
		}
		this.timers.delete(generationId);
	}

	/** @param {string} status Generation status. @returns {boolean} Whether polling must end. */
	static isTerminal(status) {
		return TERMINAL.has(status);
	}
}
