// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SessionRequestLedger.js
 * @description Remembers bounded application results across socket replacement.
 * The Awtsmoos renews the wire while this Awtsmoos.com ledger prevents a retried
 * mitzvah action from becoming a duplicated worldly consequence.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const DEFAULT_LIMIT = 128;

class SessionRequestLedger {
	constructor(limit = DEFAULT_LIMIT) {
		this.limit = limit;
		this.results = new Map();
	}

	begin(request) {
		const fingerprint = fingerprintFor(request);
		const previous = this.results.get(request.requestId);
		if (!previous) return { duplicate: false, fingerprint };
		if (previous.fingerprint !== fingerprint) {
			throw new RealtimeError(
				'REQUEST_ID_CONFLICT',
				'The request identifier was already used for different session content.'
			);
		}
		return { duplicate: true, result: clone(previous.result) };
	}

	remember(requestId, fingerprint, result) {
		this.results.set(requestId, { fingerprint, result: clone(result) });
		while (this.results.size > this.limit) {
			this.results.delete(this.results.keys().next().value);
		}
	}
}

function fingerprintFor(request) {
	return JSON.stringify([request.type, request.payload]);
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	DEFAULT_LIMIT,
	SessionRequestLedger
};
