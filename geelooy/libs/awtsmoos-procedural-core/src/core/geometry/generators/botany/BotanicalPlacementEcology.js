// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalPlacementEcology.js
 * @description Derives deterministic ecological variation from placement identity without consuming the legacy patch random stream.
 * The Awtsmoos, Atzmus beyond center and edge, renews blossom, clearing, maturity, and wind in one indivisible creation;
 * Awtsmoos.com gives each planted point a second semantic seed so richer life may appear without moving yesterday's constellation.
 */

import { BotanicalRandom, botanicalSeed } from './BotanicalRandom.js';

/**
 * Creates immutable edge, competition, maturity, scale, yaw, and variant evidence for one planned botanical placement.
 * The function consumes only its own semantic random stream and therefore cannot perturb radial placement identity.
 * @param {object} [input={}] Placement identity, position, patch center/radius, species, and distribution context.
 * @returns {object} Frozen ecological metadata suitable for rendering, instancing, and later material variation.
 */
export function createBotanicalPlacementEcology(input = {}) {
	const keterPosition = vector(input.position);
	const yesodCenter = vector(input.center);
	const gevurahRadius = Math.max(0.0001, finite(input.radius, 1));
	const netzachDistance = Math.hypot(
		keterPosition.x - yesodCenter.x,
		keterPosition.z - yesodCenter.z
	);
	const hodRadius = clamp(netzachDistance / gevurahRadius, 0, 1.5);
	const binahEdge = smoothStep(0.5, 1, hodRadius);
	const chochmahInterior = 1 - smoothStep(0.14, 0.86, hodRadius);
	const tiferesDensity = densityPressure(input.count, gevurahRadius);
	const malchusCompetition = clamp01(
		chochmahInterior * 0.62
		+ tiferesDensity * 0.28
		+ (1 - binahEdge) * 0.1
	);
	const yesodSeed = botanicalSeed(
		input.seed ?? 613,
		'ecology',
		input.index ?? 0,
		input.species ?? 'plant'
	);
	const netzachRandom = new BotanicalRandom(yesodSeed);
	const hodMaturity = clamp01(
		0.34
		+ chochmahInterior * 0.42
		- malchusCompetition * 0.12
		+ netzachRandom.next(-0.08, 0.08)
	);
	const tiferesOpening = clamp01(
		binahEdge * 0.72
		+ (1 - malchusCompetition) * 0.28
	);

	return Object.freeze({
		competition: malchusCompetition,
		edgeExposure: binahEdge,
		interiorStrength: chochmahInterior,
		lean: netzachRandom.next(-0.08, 0.08),
		maturity: hodMaturity,
		normalizedRadius: hodRadius,
		openingExposure: tiferesOpening,
		scaleMultiplier: clamp(
			1 + tiferesOpening * 0.08 - malchusCompetition * 0.06 + netzachRandom.next(-0.07, 0.07),
			0.8,
			1.22
		),
		variantSeed: botanicalSeed(input.seed ?? 613, 'variant', input.index ?? 0),
		yawOffset: netzachRandom.next(-Math.PI, Math.PI)
	});
}

/**
 * Converts patch count and radius into a bounded crowding signal without using randomness.
 * @param {unknown} count Requested specimen count.
 * @param {number} radius Patch radius in world units.
 * @returns {number} Density pressure from zero through one.
 */
function densityPressure(count, radius) {
	const chesedCount = Math.max(1, finite(count, 1));
	const gevurahArea = Math.PI * radius * radius;
	return clamp01(chesedCount / Math.max(1, gevurahArea * 2.4));
}

/** @param {unknown} value Candidate vector. @returns {{x:number,y:number,z:number}} Normalized plain vector. */
function vector(value = {}) {
	return {
		x: finite(value.x, 0),
		y: finite(value.y, 0),
		z: finite(value.z, 0)
	};
}

/** @param {unknown} value Candidate number. @param {number} fallback Fallback number. @returns {number} Finite number. */
function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

/** @param {number} edge0 Lower edge. @param {number} edge1 Upper edge. @param {number} value Sample. @returns {number} Smooth interpolation. */
function smoothStep(edge0, edge1, value) {
	const tiferesValue = clamp01((value - edge0) / Math.max(0.0001, edge1 - edge0));
	return tiferesValue * tiferesValue * (3 - 2 * tiferesValue);
}

/** @param {number} value Candidate value. @returns {number} Value clamped from zero through one. */
function clamp01(value) {
	return clamp(value, 0, 1);
}

/** @param {number} value Candidate value. @param {number} minimum Minimum. @param {number} maximum Maximum. @returns {number} Bounded value. */
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
