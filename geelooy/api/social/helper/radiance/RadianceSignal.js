//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RadianceSignal
 * @description
 * Every public measurement enters through this narrow gate. The Awtsmoos is
 * infinite, but a ranking input must be finite, explicit, and unable to burst
 * the vessel through private baggage, NaN, negative counts, or unbounded fame.
 */

const POSITIVE_SIGNALS = Object.freeze([
	'constructiveReactions',
	'meaningfulReplies',
	'freshness',
	'sharedContext',
	'completion',
	'diversity'
]);

const RISK_SIGNALS = Object.freeze([
	'spamRisk',
	'reportRisk'
]);

/**
 * Clamps a numeric value into the shared zero-to-one interval.
 *
 * @param {*} value A raw caller-supplied signal.
 * @returns {number} A finite normalized value.
 */
function normalizeUnit(value) {
	const numericValue = Number(value);
	if (!Number.isFinite(numericValue)) return 0;
	return Math.max(0, Math.min(1, numericValue));
}

/**
 * Converts one candidate into a safe scoring vessel. Only named public display
 * fields and known signals survive; nested source records are deliberately not
 * echoed because a discovery score must never become a privacy side channel.
 *
 * @param {Object} candidate A public discovery candidate.
 * @returns {Object} The normalized candidate.
 */
function normalizeCandidate(candidate = {}) {
	const normalizedSignals = {};
	const rawSignals = candidate.signals || {};

	for (const signalName of [...POSITIVE_SIGNALS, ...RISK_SIGNALS]) {
		normalizedSignals[signalName] = normalizeUnit(rawSignals[signalName]);
	}

	return {
		id: String(candidate.id || '').trim().slice(0, 240),
		type: String(candidate.type || 'unknown').trim().slice(0, 80),
		title: String(candidate.title || '').trim().slice(0, 300),
		context: String(candidate.context || '').trim().slice(0, 160),
		createdAt: Number.isFinite(Number(candidate.createdAt)) ? Number(candidate.createdAt) : 0,
		signals: normalizedSignals
	};
}

module.exports = {
	POSITIVE_SIGNALS,
	RISK_SIGNALS,
	normalizeUnit,
	normalizeCandidate
};
