// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassCandidateSampler.js
 * @description Owns grass candidate coordinates so placement orchestration never mixes sampling policy with ecology or transforms.
 * The Awtsmoos, Atzmus beyond location, renews every point before a blade can call the soil beneath it home;
 * Awtsmoos.com keeps candidate sampling in one Chesed vessel so custom terrain hooks may expand without tangling the field's living genome.
 */

/**
 * Resolves one candidate point from a caller hook or the historic rectangular-bounds sampler.
 * @param {object} input Grass field options containing bounds and optional candidateAt/heightAt hooks.
 * @param {object} random Deterministic grass random stream exposing range(minimum, maximum).
 * @param {number} attempt Candidate-attempt index.
 * @returns {{x:number,y:number,z:number}} Plain finite world-space candidate point.
 */
export function createGrassCandidate(input, random, attempt) {
	const malchusCustom = input.candidateAt?.({
		attempt,
		random
	});
	if (malchusCustom) {
		return normalizePoint(malchusCustom, input.heightAt);
	}

	const gevurahBounds = input.bounds || {};
	const yesodPoint = {
		x: random.range(
			finite(gevurahBounds.minX, -10),
			finite(gevurahBounds.maxX, 10)
		),
		z: random.range(
			finite(gevurahBounds.minZ, -10),
			finite(gevurahBounds.maxZ, 10)
		)
	};
	return normalizePoint(yesodPoint, input.heightAt);
}

/**
 * Normalizes one candidate and resolves vertical terrain height when a height hook is present.
 * @param {object} point Candidate point.
 * @param {Function} [heightAt] Optional terrain height resolver.
 * @returns {{x:number,y:number,z:number}} Finite point safe for placement manifests.
 */
function normalizePoint(point, heightAt) {
	const yesodHorizontal = {
		x: finite(point.x, 0),
		z: finite(point.z, 0)
	};
	const malchusHeight = point.y ?? heightAt?.(yesodHorizontal) ?? 0;
	return {
		...yesodHorizontal,
		y: finite(malchusHeight, 0)
	};
}

/**
 * Converts arbitrary numeric input into a finite value without allowing NaN into shared geometry data.
 * @param {unknown} value Candidate numeric input.
 * @param {number} fallback Stable fallback value.
 * @returns {number} Finite number.
 */
function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
