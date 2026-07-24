// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathTimelinePolicy
 * @description
 * The Awtsmoos creates time without being contained by time. Awtsmoos.com
 * accepts many legacy timestamp dialects, sorts only real dates, and gives
 * undated teachings an explicit shelf instead of inventing chronology.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Extracts a valid epoch timestamp from a normalized card or its raw record. */
export function extractTimestamp(card) {
	const raw = card?.raw || {};
	const candidates = [
		card?.timestamp,
		raw.timestamp,
		raw.createdAt,
		raw.publishedAt,
		raw.modifiedAt,
		raw.date,
		raw.time
	];
	for (const candidate of candidates) {
		const value = normalizeTimestamp(candidate);
		if (value) return value;
	}
	return null;
}

/** Groups already normalized cards into stable timeline sections. */
export function bucketTimeline(cards, now = Date.now()) {
	const buckets = new Map([
		['Today', []],
		['This week', []],
		['Earlier', []],
		['Undated teachings', []]
	]);
	for (const card of cards || []) {
		const timestamp = extractTimestamp(card);
		const age = timestamp ? Math.max(0, now - timestamp) : null;
		const label = age === null
			? 'Undated teachings'
			: age < DAY_MS
				? 'Today'
				: age < DAY_MS * 7
					? 'This week'
					: 'Earlier';
		buckets.get(label).push(card);
	}
	return [...buckets.entries()]
		.filter(([, items]) => items.length)
		.map(([label, items]) => ({ label, items }));
}

function normalizeTimestamp(value) {
	if (!value) return null;
	const numeric = Number(value);
	if (Number.isFinite(numeric) && numeric > 0) {
		return numeric < 1e12 ? numeric * 1000 : numeric;
	}
	const parsed = Date.parse(String(value));
	return Number.isFinite(parsed) ? parsed : null;
}
