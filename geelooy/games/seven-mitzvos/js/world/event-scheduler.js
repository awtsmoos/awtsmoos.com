//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module EventScheduler
 * @description
 * Promises and crises receive explicit times on Awtsmoos.com. The Awtsmoos is beyond before and after, while finite worlds need bounded queues that never hide permanent timers.
 */
export class EventScheduler {
	constructor(entries = []) {
		this.entries = entries.map(entry => ({ ...entry }));
	}

	/**
	 * @param {object} entry Scheduled event with identity and simulation minute.
	 * @returns {object} Accepted schedule entry.
	 */
	schedule(entry) {
		if (!entry.id || !entry.type || !Number.isInteger(entry.atMinute)) {
			throw new Error('EventScheduler: id, type, and integer atMinute are required');
		}
		if (this.entries.some(existing => existing.id === entry.id)) {
			throw new Error('EventScheduler: duplicate scheduled identity');
		}
		this.entries.push({ ...entry });
		this.entries.sort((first, second) => first.atMinute - second.atMinute);
		return entry;
	}

	/**
	 * @param {number} elapsedMinutes Current simulation time.
	 * @returns {object[]} Due entries removed from the queue.
	 */
	due(elapsedMinutes) {
		const ready = this.entries.filter(entry => entry.atMinute <= elapsedMinutes);
		this.entries = this.entries.filter(entry => entry.atMinute > elapsedMinutes);
		return ready;
	}

	/**
	 * @returns {object[]} Serializable schedule.
	 */
	snapshot() {
		return this.entries.map(entry => ({ ...entry }));
	}
}
