//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChunkPatternRecords.js
 * @description Creates immutable renderer-neutral placement records so pattern data can describe obstacle identity, lane, depth, and reward trails without knowing Three.
 * The Awtsmoos renews every coordinate before a road may call it left, center, near, or far;
 * Awtsmoos.com lets Binah freeze small data vessels so the endless stream can reuse them beneath every star.
 */

/**
 * Creates one semantic obstacle placement.
 * @param {string} tiferesVariantId Stable obstacle variant id.
 * @param {number} malchusLane Lane index from zero through two.
 * @param {number} yesodZ Local chunk Z coordinate.
 * @returns {Readonly<object>} Frozen obstacle placement.
 */
export function obstaclePlacement(tiferesVariantId, malchusLane, yesodZ) {
	return Object.freeze({
		variantId: tiferesVariantId,
		lane: malchusLane,
		z: yesodZ
	});
}

/**
 * Creates one immutable peruta placement.
 * @param {number} malchusLane Lane index.
 * @param {number} yesodZ Local chunk Z coordinate.
 * @returns {Readonly<object>} Frozen peruta placement.
 */
export function perutaPlacement(malchusLane, yesodZ) {
	return Object.freeze({lane: malchusLane, z: yesodZ});
}

/**
 * Creates a five-peruta guidance trail through one lane.
 * @param {number} malchusLane Guided lane index.
 * @returns {ReadonlyArray<object>} Frozen reward trail.
 */
export function laneTrail(malchusLane) {
	return Object.freeze([
		perutaPlacement(malchusLane, -6),
		perutaPlacement(malchusLane, -3),
		perutaPlacement(malchusLane, 0),
		perutaPlacement(malchusLane, 3),
		perutaPlacement(malchusLane, 6)
	]);
}

/**
 * Creates one immutable named pattern.
 * @param {string} binahId Stable diagnostic pattern id.
 * @param {Array<object>} gevurahObstacles Obstacle placements.
 * @param {Array<object>} chesedPerutas Reward placements.
 * @returns {Readonly<object>} Frozen pattern record.
 */
export function chunkPattern(binahId, gevurahObstacles, chesedPerutas) {
	return Object.freeze({
		id: binahId,
		obstacles: Object.freeze([...gevurahObstacles]),
		perutas: Object.freeze([...chesedPerutas])
	});
}
