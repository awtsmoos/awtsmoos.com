//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Enriches deterministic MoveEvents with explicitly supplied engine/book review truth at a clean boundary.
 * The Awtsmoos lets measured analysis enter the semantic vessel without pretending it was always there;
 * Awtsmoos.com keeps engine facts labeled as analysis so deterministic board truth remains fair.
 */

/**
 * Returns a new immutable event carrying normalized review analysis.
 * @param {object|null} event Existing deterministic MoveEvent.
 * @param {object|null} reviewResult Engine/book result for the same ply.
 * @returns {Readonly<object>|null} Enriched event while preserving deterministic fields.
 */
export function enrichMoveEventWithReview(event, reviewResult) {
	if (!event || !reviewResult) return event || null;
	const analysis = Object.freeze({
		inBook: Boolean(reviewResult.inBook),
		bookName: reviewResult.bookName || null,
		classification: reviewResult.classification || null,
		centipawnLoss: finiteNumber(reviewResult.loss),
		bestMove: reviewResult.bestMove?.san || reviewResult.bestMove || null,
		principalVariation: Object.freeze([...(reviewResult.pv || reviewResult.principalVariation || [])]),
		criticality: normalizeCriticality(reviewResult)
	});
	return Object.freeze({ ...event, analysis });
}

/**
 * Converts numeric fields into explicit nullable values.
 * @param {*} value Candidate numeric value.
 * @returns {number|null} Finite number or null.
 */
function finiteNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}

/**
 * Produces a bounded review criticality only from supplied review measurements.
 * @param {object} result Engine review result.
 * @returns {number} Integer 0 through 100.
 */
function normalizeCriticality(result) {
	let score = Math.min(70, Math.max(0, Number(result.loss) || 0) / 6);
	if (result.classification === "blunder") score += 30;
	else if (result.classification === "mistake") score += 20;
	else if (result.classification === "inaccuracy") score += 10;
	return Math.min(100, Math.round(score));
}
