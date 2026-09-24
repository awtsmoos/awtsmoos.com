// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Drains bounded mailbox batches without monopolizing the connection child.
 * @description
 * The Awtsmoos reveals many durable envelopes through measured turns. Awtsmoos.com
 * yields between batches so replay cannot starve websocket health, parent testimony,
 * or a newer terminal settlement while old work is being remembered.
 *
 * Continuation (C19): one failed send is recorded as a per-entry outcome and the
 * drain CONTINUES with the next envelope — a poison head can never starve the
 * lane behind it. The completion callback receives the per-entry outcomes
 * [{entry, delivered}] so the caller can account failures (poison quarantine)
 * and clear them (successful sends). Fencing filters always run BEFORE the drain;
 * ordering here is deterministic (updatedAt, then id) so replays are stable.
 */
function create(options = {}) {
	const batchSize = bounded(options.batchSize, 8);
	const schedule = options.schedule || setImmediate;

	function drain(entries = [], effect, complete = () => {}) {
		const ordered = stableOrder(entries);
		const outcomes = [];
		let index = 0;
		function next() {
			const end = Math.min(ordered.length, index + batchSize);
			while (index < end) {
				const entry = ordered[index];
				let delivered = false;
				try {
					delivered = effect(entry) === true;
				} catch {
					delivered = false;
				}
				outcomes.push({ entry, delivered });
				index += 1;
			}
			if (index < ordered.length) return schedule(next);
			complete(outcomes);
		}
		next();
	}

	return { drain };
}

/**
 * Deterministic replay order: oldest first by updatedAt, entry id breaks ties.
 * A stable order keeps redelivery predictable across restarts and tests.
 */
function stableOrder(entries = []) {
	return [...entries].sort((a, b) => {
		const aTime = entryTime(a);
		const bTime = entryTime(b);
		if (aTime !== bTime) return aTime - bTime;
		const aId = String(entryId(a));
		const bId = String(entryId(b));
		return aId < bId ? -1 : aId > bId ? 1 : 0;
	});
}

function entryTime(entry) {
	const value = Number(entry?.updatedAt ?? entry?.value?.updatedAt ?? 0);
	return Number.isFinite(value) ? value : 0;
}

function entryId(entry) {
	return entry?.id ?? entry?.requestId ?? entry?.value?.requestId ?? "";
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1, Math.min(64, Math.floor(number)))
		: fallback;
}

module.exports = {
	bounded,
	create,
	stableOrder
};
