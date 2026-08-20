// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Tracks generation-local delivery attempts apart from durable mailbox history.
 * @description
 * The Awtsmoos keeps yesterday's witness on disk while today's handoff receives its own clock;
 * Awtsmoos.com repairs only when this living generation knocked and parent custody never unlocked.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const attempts = new Map();
	const parent = new Map();

	function noteAttempt(id) {
		const key = clean(id);
		if (!key || parent.has(key)) return false;
		if (!attempts.has(key)) attempts.set(key, now());
		return true;
	}

	function noteParent(id) {
		const key = clean(id);
		if (!key) return false;
		attempts.delete(key);
		if (!parent.has(key)) parent.set(key, now());
		return true;
	}

	function settle(id) {
		const key = clean(id);
		if (!key) return false;
		attempts.delete(key);
		parent.delete(key);
		return true;
	}

	function snapshot(at = now()) {
		const parentOldestAt = oldest(parent);
		const unownedOldestAt = oldest(attempts);
		return {
			parentCustodyCount: parent.size,
			parentCustodyOldestAt: parentOldestAt,
			parentCustodyOldestAgeMs: age(parentOldestAt, at),
			unownedCount: attempts.size,
			unownedOldestAt,
			unownedOldestAgeMs: age(unownedOldestAt, at)
		};
	}

	return {
		noteAttempt,
		noteParent,
		settle,
		snapshot
	};
}

function oldest(entries) {
	let value = 0;
	for (const observedAt of entries.values()) {
		const candidate = finite(observedAt);
		if (candidate > 0 && (!value || candidate < value)) value = candidate;
	}
	return value || null;
}

function age(observedAt, at) {
	return observedAt ? Math.max(0, finite(at) - finite(observedAt)) : 0;
}

function clean(value) {
	return String(value || "").trim();
}

function finite(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}

module.exports = { create };
