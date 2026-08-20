// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Plans deterministic age, count, and byte retention without touching storage.
 * @description
 * The Awtsmoos renews the present while yesterday's vessels need not grow forever.
 * Awtsmoos.com removes oldest unprotected history when any limit cries, yet living
 * and pinned testimony remains untouched even when pressure must be reported unsatisfied.
 */
function plan(records = [], limits = {}, now = Date.now()) {
	const ordered = records.map(normalize).sort(compareOldest);
	const removed = new Set();
	const reasons = new Map();
	const maxAgeMs = positive(limits.maxAgeMs);
	const maxRecords = positive(limits.maxRecords);
	const maxBytes = positive(limits.maxBytes);

	if (maxAgeMs) {
		for (const record of ordered) {
			if (record.protected || now - record.createdAt <= maxAgeMs) continue;
			mark(record, "age", removed, reasons);
		}
	}
	removeUntilCount(ordered, removed, reasons, maxRecords);
	removeUntilBytes(ordered, removed, reasons, maxBytes);
	const kept = ordered.filter(record => !removed.has(record.id));
	return {
		remove: ordered.filter(record => removed.has(record.id)),
		kept,
		reasons: Object.fromEntries(reasons),
		pressure: pressure(kept, { maxAgeMs, maxRecords, maxBytes }, now)
	};
}

function removeUntilCount(records, removed, reasons, maxRecords) {
	if (!maxRecords) return;
	while (remaining(records, removed).length > maxRecords) {
		const victim = oldestRemovable(records, removed);
		if (!victim) break;
		mark(victim, "count", removed, reasons);
	}
}

function removeUntilBytes(records, removed, reasons, maxBytes) {
	if (!maxBytes) return;
	while (byteTotal(remaining(records, removed)) > maxBytes) {
		const victim = oldestRemovable(records, removed);
		if (!victim) break;
		mark(victim, "bytes", removed, reasons);
	}
}

function oldestRemovable(records, removed) {
	return records.find(record => !removed.has(record.id) && !record.protected) || null;
}

function mark(record, reason, removed, reasons) {
	removed.add(record.id);
	if (!reasons.has(record.id)) reasons.set(record.id, reason);
}

function pressure(records, limits, now) {
	const oldestExpired = limits.maxAgeMs
		? records.some(record => now - record.createdAt > limits.maxAgeMs)
		: false;
	return {
		age: oldestExpired,
		count: Boolean(limits.maxRecords && records.length > limits.maxRecords),
		bytes: Boolean(limits.maxBytes && byteTotal(records) > limits.maxBytes),
		records: records.length,
		bytesTotal: byteTotal(records),
		protectedRecords: records.filter(record => record.protected).length
	};
}

function remaining(records, removed) {
	return records.filter(record => !removed.has(record.id));
}

function byteTotal(records) {
	return records.reduce((sum, record) => sum + record.bytes, 0);
}

function normalize(record, index) {
	return {
		...record,
		id: String(record.id ?? index),
		createdAt: finite(record.createdAt, 0),
		bytes: Math.max(0, finite(record.bytes, 0)),
		protected: record.protected === true
	};
}

function compareOldest(left, right) {
	return left.createdAt - right.createdAt || left.id.localeCompare(right.id);
}

function positive(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

module.exports = {
	byteTotal,
	plan
};
