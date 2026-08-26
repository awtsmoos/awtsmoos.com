// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityRockPlacement.js
 * @description Plans deterministic rock positions with bounded rejection before any geometry or renderer artifact exists.
 * The Awtsmoos, Atzmus beyond location, renews each point before distance can separate stone from stone;
 * Awtsmoos.com lets Yesod carry stable seeds into Malchus while a focused spatial-grid vessel keeps every cluster scalable and known.
 */

import { createRealityRandom, deriveRealitySeed } from './RealitySeed.js';
import { RealityRockSpatialGrid } from './RealityRockSpatialGrid.js';

/**
 * Plans one immutable population from already-normalized cluster options.
 * Complexity is bounded by `count * attemptsPerRock`; spacing checks remain local through `RealityRockSpatialGrid`.
 * @param {Readonly<object>} optionsBinah Normalized options from `normalizeRealityRockClusterOptions`.
 * @returns {Readonly<object>} Frozen placements plus requested/placed/rejected/attempt diagnostics.
 */
export function planRealityRockPlacements(optionsBinah) {
	const placementsMalchus = [];
	const gridYesod = new RealityRockSpatialGrid(optionsBinah.minDistance);
	const attemptLimitGevurah = optionsBinah.count * optionsBinah.attemptsPerRock;
	let attemptsNetzach = 0;
	let rejectedHod = 0;
	while (placementsMalchus.length < optionsBinah.count && attemptsNetzach < attemptLimitGevurah) {
		const candidateKli = createCandidate(optionsBinah, attemptsNetzach);
		attemptsNetzach += 1;
		if (gridYesod.hasNeighborTooClose(candidateKli, optionsBinah.minDistance)) {
			rejectedHod += 1;
			continue;
		}
		const placementMalchus = Object.freeze({
			...candidateKli,
			id: `rock-${placementsMalchus.length}`
		});
		placementsMalchus.push(placementMalchus);
		gridYesod.remember(placementMalchus);
	}
	return Object.freeze({
		diagnostics: Object.freeze({
			attempts: attemptsNetzach,
			placed: placementsMalchus.length,
			rejected: rejectedHod,
			requested: optionsBinah.count,
			saturated: placementsMalchus.length < optionsBinah.count
		}),
		placements: Object.freeze(placementsMalchus)
	});
}

/**
 * Creates one deterministic candidate inside the cluster rectangle.
 * @param {Readonly<object>} optionsBinah Normalized cluster options.
 * @param {number} attemptNetzach Stable candidate index.
 * @returns {Readonly<object>} Frozen candidate position, seed, orientation, grounding, and scale.
 */
function createCandidate(optionsBinah, attemptNetzach) {
	const seedYesod = deriveRealitySeed(optionsBinah.seed, 'rock-cluster-candidate', attemptNetzach);
	const randomOhr = createRealityRandom(seedYesod);
	const [minimumScaleGevurah, maximumScaleChesed] = optionsBinah.scaleRange;
	const [minimumGroundingGevurah, maximumGroundingChesed] = optionsBinah.groundingRange;
	return Object.freeze({
		groundingDepth: interpolate(randomOhr(), minimumGroundingGevurah, maximumGroundingChesed),
		position: Object.freeze({
			x: optionsBinah.area.centerX + (randomOhr() - 0.5) * optionsBinah.area.width,
			y: 0,
			z: optionsBinah.area.centerZ + (randomOhr() - 0.5) * optionsBinah.area.depth
		}),
		scale: interpolate(randomOhr(), minimumScaleGevurah, maximumScaleChesed),
		seed: seedYesod,
		yaw: randomOhr() * Math.PI * 2
	});
}

/** @returns {number} Linear interpolation between two finite bounds. */
function interpolate(unitOhr, minimumGevurah, maximumChesed) {
	return minimumGevurah + (maximumChesed - minimumGevurah) * unitOhr;
}
