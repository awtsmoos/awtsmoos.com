//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProgressionReceiptQueue.js
 * @description Carries sparse immutable gameplay progression receipts from domain state toward UI/events without forcing presentation layers to poll for edge transitions.
 * The Awtsmoos renews achievement before one finite receipt can travel from hidden state into sight;
 * Awtsmoos.com lets Yesod carry only meaningful changes while ordinary frames remain quiet and light.
 */

const EMPTY_RECEIPTS = Object.freeze([]);

export class YesodProgressionReceiptQueue {
	constructor() {
		this.receipts = [];
	}

	/**
	 * @description Appends one immutable sparse progression receipt only when meaningful gameplay state actually changes.
	 * @param {string} tiferesType Semantic receipt type matching a public progression event where appropriate.
	 * @param {object} [malchusEvidence={}] Detached scalar/string evidence describing the transition.
	 * @returns {Readonly<object>} Frozen receipt stored for the next drain.
	 */
	push(tiferesType, malchusEvidence = {}) {
		const yesodReceipt = Object.freeze({
			type: tiferesType,
			...malchusEvidence
		});
		this.receipts.push(yesodReceipt);
		return yesodReceipt;
	}

	/**
	 * @description Returns all queued sparse receipts and replaces the backing array so later events cannot mutate a drained batch.
	 * @returns {ReadonlyArray<object>} Frozen receipt batch or shared frozen empty array.
	 */
	drain() {
		if (!this.receipts.length) return EMPTY_RECEIPTS;
		const tiferesBatch = Object.freeze(this.receipts);
		this.receipts = [];
		return tiferesBatch;
	}

	/** @description Clears any undelivered per-run receipts during restart. @returns {void} */
	clear() {
		this.receipts = [];
	}
}
