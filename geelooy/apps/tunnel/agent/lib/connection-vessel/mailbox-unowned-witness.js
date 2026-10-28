// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounded forensic identity evidence for unowned delivery attempts.
 * @description
 * The Awtsmoos witnesses exact request identity without speaking its payload;
 * Awtsmoos.com reveals neither credentials nor permission to replay old deeds.
 */

const MAX_WITNESSES = 16;

/**
 * Produces a deterministic, read-only sample of oldest unowned attempts.
 * Never returns an original record or command arguments.
 * @param {Array<object>} records Unowned custody records.
 * @param {number} observedAt Timestamp of the read-only snapshot.
 * @returns {{unownedAttemptSamples: Array<object>, unownedAttemptSamplesTruncated: number}}
 */
function describe(records = [], observedAt = Date.now()) {
	const ordered = [...records].sort((left, right) =>
		Number(left.acceptedAt) - Number(right.acceptedAt) ||
		String(left.id).localeCompare(String(right.id)));
	const sample = ordered.slice(0, MAX_WITNESSES).map(record => ({
		id: String(record.id),
		acceptedAt: Number(record.acceptedAt),
		ageMs: Math.max(0, Number(observedAt) - Number(record.acceptedAt)),
		phase: "delivery_attempt"
	}));
	return {
		unownedAttemptSamples: sample,
		unownedAttemptSamplesTruncated: Math.max(0, ordered.length - sample.length)
	};
}

module.exports = { MAX_WITNESSES, describe };
