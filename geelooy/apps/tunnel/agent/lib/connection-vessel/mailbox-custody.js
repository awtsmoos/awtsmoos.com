// B"H
// Boruch Hashem
// Blessed is He

const Record = require("./mailbox-custody-record.js");

/**
 * @file Mutates exact request custody while record mechanics remain isolated.
 * @description
 * The Awtsmoos gives every accepted deed its own phase lease. Awtsmoos.com moves
 * that exact record from delivery attempt through parent custody and settlement, so
 * unrelated work can never rejuvenate, decrement, or conceal an abandoned request.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const attempts = new Map();
	const parent = new Map();

	function noteAttempt(id, metadata = {}) {
		const key = Record.clean(id);
		if (!key || parent.has(key)) return false;
		if (!attempts.has(key)) {
			attempts.set(key, Record.make(key, "delivery_attempt", metadata, now()));
		}
		return true;
	}

	function noteParent(id, metadata = {}) {
		const key = Record.clean(id);
		if (!key) return false;
		attempts.delete(key);
		parent.set(key, Record.make(
			key,
			"accepted_waiting_for_consumer",
			metadata,
			now()
		));
		return true;
	}

	function progress(id, metadata = {}) {
		const key = Record.clean(id);
		const existing = parent.get(key);
		if (!existing) return false;
		parent.set(key, Record.progress(existing, metadata, now()));
		return true;
	}

	function settle(id) {
		const key = Record.clean(id);
		if (!key) return false;
		attempts.delete(key);
		parent.delete(key);
		return true;
	}

	function records() {
		return Array.from(parent.values()).map(record => ({ ...record }));
	}

	function snapshot(observedAt = now()) {
		return Record.snapshot(parent, attempts, observedAt);
	}

	return {
		noteAttempt,
		noteParent,
		progress,
		records,
		settle,
		snapshot
	};
}

module.exports = { create };
