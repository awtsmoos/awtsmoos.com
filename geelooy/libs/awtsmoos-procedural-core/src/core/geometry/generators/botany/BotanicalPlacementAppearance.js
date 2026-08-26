// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalPlacementAppearance.js
 * @description Resolves cosmetic scale and yaw from a semantic stream isolated from botanical placement geometry.
 * The Awtsmoos, Atzmus beyond size and direction, renews every leaning stem without forcing the garden's coordinates to move;
 * Awtsmoos.com places appearance in its own Hod vessel so beauty may deepen while Netzach keeps positional identity true.
 */

import { BotanicalRandom, botanicalSeed } from './BotanicalRandom.js';

/**
 * Creates one immutable appearance record without consuming the patch planner's geometry random stream.
 * @param {object} [input={}] Seed, index, base scale/yaw, explicit variation, ecology, and natural-variation policy.
 * @returns {object} Frozen scale and yaw values for one botanical placement.
 */
export function createBotanicalPlacementAppearance(input = {}) {
	const yesodSeed = botanicalSeed(input.seed ?? 613, 'appearance', input.index ?? 0);
	const hodRandom = new BotanicalRandom(yesodSeed);
	const chesedScale = Math.max(0.05, finite(input.scale, 1));
	const gevurahVariation = Math.max(0, finite(input.scaleVariation, 0));
	const tiferesScale = gevurahVariation > 0
		? chesedScale * hodRandom.next(1 - gevurahVariation, 1 + gevurahVariation)
		: chesedScale;
	const malchusYaw = finite(input.yaw, 0);
	const netzachEcology = input.ecology || {};
	const yesodNatural = Boolean(input.naturalVariation);

	return Object.freeze({
		scale: yesodNatural
			? tiferesScale * finite(netzachEcology.scaleMultiplier, 1)
			: tiferesScale,
		yaw: yesodNatural
			? malchusYaw + finite(netzachEcology.yawOffset, 0)
			: malchusYaw
	});
}

/**
 * Normalizes an appearance number without allowing NaN or Infinity into a reusable placement manifest.
 * @param {unknown} value Candidate numeric value.
 * @param {number} fallback Stable fallback value.
 * @returns {number} Finite numeric value.
 */
function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
