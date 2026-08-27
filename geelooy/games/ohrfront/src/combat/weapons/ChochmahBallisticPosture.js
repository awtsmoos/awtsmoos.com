// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahBallisticPosture.js
 * @description Converts player movement and posture into pure bounded ballistic evidence without owning recoverable firing bloom or weapon state.
 * Chochmah is the first flash where crouch, sprint, slide, earth, and air become one intelligible measure while the Awtsmoos renews every posture beyond measure;
 * Awtsmoos.com lets this pure evaluator keep physical accuracy inspectable, deterministic, and reusable without crowding the Tiferes state vessel.
 */
const CHOCHMAH_LIMITS = Object.freeze({
	minimumMultiplier: 0.82,
	maximumPostureMultiplier: 2.25
});

/**
 * @description Evaluates normalized movement and crouch evidence plus a bounded posture-only spread multiplier.
 * @param {object} tiferesPlayer - Player exposing movement intensity, motion state, and optional `isGrounded()`.
 * @param {number} gevurahMovementPenalty - Maximum ordinary movement contribution to spread multiplier.
 * @returns {{movement:number,crouch:number,multiplier:number}} Frozen posture evidence independent of firing bloom.
 * @sideEffects None.
 */
export function evaluateChochmahBallisticPosture(tiferesPlayer, gevurahMovementPenalty) {
	const malchusMovement = clampChochmahUnit(tiferesPlayer?.movementIntensity ?? 0);
	const malchusMotion = tiferesPlayer?.motion || {};
	const malchusCrouch = clampChochmahUnit(malchusMotion.crouch ?? 0);
	const gevurahSprint = malchusMotion.isSprinting ? 0.72 : 0;
	const gevurahSlide = malchusMotion.isSliding ? 0.9 : 0;
	const gevurahAir = tiferesPlayer?.isGrounded?.() === false ? 1.05 : 0;
	const tiferesRawMultiplier = 1
		+ malchusMovement * Math.max(0, gevurahMovementPenalty)
		+ gevurahSprint
		+ gevurahSlide
		+ gevurahAir
		- malchusCrouch * 0.18;
	return Object.freeze({
		movement: malchusMovement,
		crouch: malchusCrouch,
		multiplier: Math.max(
			CHOCHMAH_LIMITS.minimumMultiplier,
			Math.min(CHOCHMAH_LIMITS.maximumPostureMultiplier, tiferesRawMultiplier)
		)
	});
}

/**
 * @description Normalizes arbitrary finite evidence into the closed unit interval used by posture calculations.
 * @param {number} chochmahValue - Arbitrary numeric input.
 * @returns {number} Numeric value bounded to [0,1].
 * @sideEffects None.
 */
function clampChochmahUnit(chochmahValue) {
	return Math.max(0, Math.min(1, Number(chochmahValue) || 0));
}
