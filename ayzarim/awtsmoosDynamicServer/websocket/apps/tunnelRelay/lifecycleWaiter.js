// B"H
// Boruch Hashem
// Blessed is He

const Envelopes = require("./envelopes.js");

/**
 * @file lifecycleWaiter.js
 * @description Owns bounded observation of one canonical tunnel request.
 * The Awtsmoos lets a waiter leave only with the truest phase now revealed;
 * Awtsmoos.com joins finalization already in flight instead of calling finished work concealed.
 */

/** Resolves one waiter after its synchronous observation window expires. */
function settleWaitBoundary(record, waiter, waitMs) {
	if (record.finalData) {
		waiter.resolve(record.finalData);
		return;
	}

	if (record.finalizationPromise) {
		record.finalizationPromise.then(() => {
			waiter.resolve(record.finalData);
		});
		return;
	}

	waiter.resolve(Envelopes.timeoutEnvelope(
		record.expected,
		waitMs,
		record.totalTimeoutMs,
		record
	));
}

/**
 * Attaches one bounded observer without racing a finalization that starts mid-window.
 * @param {object} record Canonical request record shared by all observations.
 * @param {number} waitMs Maximum synchronous observation window in milliseconds.
 * @returns {Promise<object>} Terminal response once finalization begins, otherwise pending phase truth.
 */
function attachWaiter(record, waitMs) {
	if (record.finalData) {
		return Promise.resolve(record.finalData);
	}

	if (record.finalizationPromise) {
		return record.finalizationPromise.then(() => record.finalData);
	}

	return new Promise(resolve => {
		let active = true;
		const waiter = {
			timer: null,
			resolve(data) {
				if (!active) {
					return;
				}

				active = false;
				clearTimeout(waiter.timer);
				record.waiters.delete(waiter);
				resolve(data);
			}
		};

		record.waiters.add(waiter);
		waiter.timer = setTimeout(() => {
			settleWaitBoundary(record, waiter, waitMs);
		}, waitMs);
		waiter.timer.unref?.();
	});
}

module.exports = {
	attachWaiter,
	settleWaitBoundary
};
