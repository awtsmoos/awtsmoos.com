// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reveals current-child inbox deeds that have not reached exact parent custody.
 * @description
 * The Awtsmoos gives every accepted deed a living path from parchment into hand;
 * Awtsmoos.com measures the oldest unowned keli so a silent parent cannot hide where requests stand.
 */
function revealOhrUnownedIngress(entries = [], custodyRecords = [], observedAt = Date.now()) {
	const custodyIds = new Set(
		custodyRecords.map(record => String(record?.id || "")).filter(Boolean)
	);
	const unownedKeilim = entries.filter(entry => {
		const id = String(entry?.id || "");
		return id && !custodyIds.has(id);
	});
	const oldestAt = oldestOhrTimestamp(unownedKeilim.map(entry => entry?.updatedAt));
	return {
		entryUnownedCount: unownedKeilim.length,
		entryUnownedOldestAt: oldestAt,
		entryUnownedOldestAgeMs: ohrAge(oldestAt, observedAt)
	};
}

/** Returns the earliest valid timestamp without inventing testimony from malformed values. */
function oldestOhrTimestamp(values = []) {
	const finite = values
		.map(value => Date.parse(String(value || "")))
		.filter(value => Number.isFinite(value) && value > 0);
	return finite.length ? new Date(Math.min(...finite)).toISOString() : null;
}

/** Measures one timestamp against the shared observation instant. */
function ohrAge(value, observedAt) {
	const timestamp = Date.parse(String(value || ""));
	const at = Number(observedAt);
	if (!Number.isFinite(timestamp) || !Number.isFinite(at)) return 0;
	return Math.max(0, at - timestamp);
}

module.exports = {
	ohrAge,
	oldestOhrTimestamp,
	revealOhrUnownedIngress
};
