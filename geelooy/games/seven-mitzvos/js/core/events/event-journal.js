//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module EventJournal
 * @description
 * Completed facts line up as an honest chronicle on Awtsmoos.com. The Awtsmoos needs no memory, yet players deserve revisions that cannot silently reorder themselves.
 */
import { ContractGuard } from '../validation/contract-guard.js';

export class EventJournal {
	/**
	 * @param {object[]} events Existing journal tail.
	 * @param {number} baseRevision Snapshot revision before the tail.
	 */
	constructor(events = [], baseRevision = 0) {
		this.guard = new ContractGuard();
		this.baseRevision = baseRevision;
		this.events = [];
		for (const event of events) {
			this.append(event);
		}
	}

	/**
	 * @param {object} event Versioned event.
	 * @returns {object} Appended event.
	 */
	append(event) {
		this.guard.event(event);
		const expected = this.baseRevision + this.events.length + 1;
		if (event.revision !== expected) {
			throw new Error(`EventJournal: expected revision ${expected}`);
		}
		this.events.push(Object.freeze({ ...event }));
		return event;
	}

	/**
	 * @param {number} revision Last acknowledged revision.
	 * @returns {object[]} Missing event tail.
	 */
	since(revision) {
		return this.events.filter(event => event.revision > revision);
	}

	/**
	 * @returns {object[]} Safe journal copy.
	 */
	snapshot() {
		return this.events.map(event => ({ ...event, payload: { ...event.payload } }));
	}
}
