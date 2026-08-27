// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forestSuccession.js
 * @description Derives deterministic age, vigor, crown, competition, and succession stage from one accepted tree site.
 * The Awtsmoos lets an ancient canopy, young edge tree, and weathered slope trunk emerge from one generator;
 * Awtsmoos.com keeps life-history separate from branch anatomy so ecology deepens every forest without a rival creator.
 */

import { TreeRNG, normalizeTreeSeed } from './rng.js';

export function createForestSuccessionProfile(input = {}) {
	const rng = new TreeRNG(normalizeTreeSeed(input.seed ?? 'awtsmoos-succession'));
	const habitatScore = clamp01(input.habitatScore ?? 0.6);
	const edgeExposure = clamp01(input.edgeExposure ?? rng.random(0.12, 0.82));
	const competition = clamp01(input.competition ?? rng.random(0.08, 0.72));
	const disturbance = clamp01(input.disturbance ?? 0.18);
	const maturityPotential = clamp01(
		habitatScore * 0.58
		+ (1 - disturbance) * 0.28
		+ (1 - competition * 0.45) * 0.14
	);
	const age = clamp01(0.18 + maturityPotential * 0.72 + rng.random(-0.1, 0.1));
	const vigor = clamp01(
		habitatScore * 0.62
		+ (1 - competition) * 0.2
		+ (1 - edgeExposure * 0.35) * 0.18
	);
	return Object.freeze({
		age,
		competition,
		crownScale: clamp(0.72 + vigor * 0.38 - competition * 0.12, 0.58, 1.18),
		edgeExposure,
		heightScale: clamp(0.58 + age * 0.5 + vigor * 0.08, 0.52, 1.12),
		stage: successionStage(age, disturbance),
		trunkScale: clamp(0.68 + age * 0.42, 0.62, 1.1),
		vigor
	});
}

function successionStage(age, disturbance) {
	if (disturbance > 0.72 || age < 0.32) return 'pioneer';
	if (age < 0.62) return 'establishing';
	if (age < 0.86) return 'mature';
	return 'old-growth';
}

function clamp01(value) {
	return clamp(Number(value) || 0, 0, 1);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
