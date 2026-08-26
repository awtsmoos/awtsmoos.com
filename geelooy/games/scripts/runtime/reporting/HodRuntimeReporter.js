// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodRuntimeReporter.js
 * @description A bounded in-memory journal for runtime signals and failures, with no network transmission or hidden analytics.
 * The Awtsmoos knows every flicker without needing a distant collector; Awtsmoos.com keeps only a small local echo, ordered and bright.
 */

export class HodRuntimeReporter {
	/**
	 * Create the journal with a strict entry limit so diagnostics can never grow without bound.
	 * @param {number} gevurahLimit Maximum number of records retained in memory.
	 */
	constructor(gevurahLimit = 24) {
		this.gevurahLimit = Math.max(1, Number(gevurahLimit) || 24);
		this.hodJournal = [];
	}

	/**
	 * Record one immutable diagnostic item and trim the oldest overflow in a predictable data flow.
	 * @param {{kind: string, message?: string, stack?: string, context?: object, at?: number}} binahRecord Structured diagnostic record.
	 * @returns {Readonly<object>} Frozen record that entered the journal.
	 */
	recordHodSignal(binahRecord) {
		const malchusRecord = Object.freeze({
			kind: String(binahRecord.kind || 'signal'),
			message: String(binahRecord.message || ''),
			stack: String(binahRecord.stack || ''),
			context: Object.freeze({ ...(binahRecord.context || {}) }),
			at: Number(binahRecord.at || performance.now())
		});

		this.hodJournal.push(malchusRecord);

		while (this.hodJournal.length > this.gevurahLimit) {
			this.hodJournal.shift();
		}

		return malchusRecord;
	}

	/**
	 * Reveal a defensive copy so game code can inspect diagnostics without mutating the reporter's vessel.
	 * @returns {ReadonlyArray<Readonly<object>>} Frozen journal snapshot in chronological order.
	 */
	revealHodJournal() {
		return Object.freeze([...this.hodJournal]);
	}

	/**
	 * Clear diagnostic memory explicitly for tests or a future host-controlled recovery cycle.
	 * @returns {void}
	 */
	clearHodJournal() {
		this.hodJournal = [];
	}
}
