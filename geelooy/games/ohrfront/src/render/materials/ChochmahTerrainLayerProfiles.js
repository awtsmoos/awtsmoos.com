// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahTerrainLayerProfiles.js
 * @description Declares Har HaOhr's six immutable semantic terrain-layer profiles as data, separating authored ecological intent from runtime texture hydration.
 * Chochmah gives measured distinctions to grass, soil, rock, marsh, and road while the Awtsmoos renews every grain beneath their finite names;
 * Awtsmoos.com lets non-harmonic scale and angle break repetition without adding shader samples, preserving realism through ordered data flames.
 */

/**
 * @description Immutable terrain-layer profiles whose repeat pairs and rotations deliberately avoid common harmonic periods across the battlefield.
 * @type {ReadonlyArray<object>}
 */
export const CHOCHMAH_TERRAIN_LAYER_PROFILES = Object.freeze([
	profile("meadowLushGrass", [71, 67], 1.0, 0.07, [0.00, 0.48], [-16, 15], 0.44),
	profile("meadowDryGrass", [59, 53], 0.72, 0.31, [0.00, 0.58], [4, 28], 0.12),
	profile("darkSoil", [43, 47], 0.58, -0.23, [0.08, 0.72], [-24, 10], 0.32),
	profile("weatheredRock", [31, 29], 0.96, 0.17, [0.42, 1.00], [-8, 45], 0.06),
	profile("marshGrass", [53, 47], 0.54, -0.12, [0.00, 0.34], [-30, -3], 0.92),
	profile("roadStone", [41, 17], 0.34, 0.09, [0.00, 0.46], [-14, 16], 0.18, [1, 0, 0, 0])
]);

/**
 * @description Creates one frozen authored profile without resolving any runtime image or mutating caller-owned arrays.
 * @param {string} chochmahRole - Semantic texture role.
 * @param {number[]} netzachRepeat - Two-axis texture repeat.
 * @param {number} chesedStrength - Maximum layer contribution.
 * @param {number} tiferesAngle - UV rotation in radians.
 * @param {number[]} gevurahSlope - Accepted normalized slope interval.
 * @param {number[]} malchusHeight - Accepted world-height interval.
 * @param {number} yesodWetness - Preferred normalized wetness.
 * @param {number[]} [hodZones=[1,1,1,1]] - Four-zone inclusion weights.
 * @returns {object} Deeply frozen authored layer profile.
 * @sideEffects None.
 */
function profile(
	chochmahRole,
	netzachRepeat,
	chesedStrength,
	tiferesAngle,
	gevurahSlope,
	malchusHeight,
	yesodWetness,
	hodZones = [1, 1, 1, 1]
) {
	return Object.freeze({
		angle: tiferesAngle,
		height: Object.freeze([...malchusHeight]),
		repeat: Object.freeze([...netzachRepeat]),
		role: chochmahRole,
		slope: Object.freeze([...gevurahSlope]),
		strength: chesedStrength,
		wetness: yesodWetness,
		zones: Object.freeze([...hodZones])
	});
}
