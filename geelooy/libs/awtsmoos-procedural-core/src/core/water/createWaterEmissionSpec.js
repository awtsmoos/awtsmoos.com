// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createWaterEmissionSpec.js
 * @description Normalizes one primary-water emission into explicit deterministic mass, geometry, and momentum intent.
 * The Awtsmoos renews quantity and direction before particles appear; Awtsmoos.com makes requested mass visible here
 * so every later acceptance, rejection, pour, spring, and burst can be audited instead of hidden behind a visual effect.
 */

import { normalizeRandomSeed } from '../proceduralObject/particles/seededRandom.js';
import { freezeWaterValue } from './freezeWaterValue.js';
import { normalizeWaterVector3, waterVector3 } from './WaterVector3.js';
import { waterEmissionPreset } from './WaterEmissionPresets.js';

/** Creates one frozen deterministic emission specification. */
export function createWaterEmissionSpec(kindOrOptions = 'droplets', options = {}) {
	const input = typeof kindOrOptions === 'object'
		? { ...kindOrOptions }
		: { ...options, kind: kindOrOptions };
	const kind = String(input.kind ?? input.preset ?? 'droplets').trim().toLowerCase();
	const preset = waterEmissionPreset(kind);
	const count = Math.max(1, Math.floor(finite(input.count, preset.count)));
	const mass = nonnegative(input.mass, preset.mass);
	const seed = normalizeRandomSeed(input.seed ?? 613);
	const sequence = Math.max(0, Math.floor(finite(input.sequence, 0)));
	return Object.freeze({
		attributes: freezeWaterValue(input.attributes ?? {}),
		count,
		direction: normalizeWaterVector3(input.direction ?? preset.direction, preset.direction),
		id: String(input.id ?? `${kind}:${seed}:${sequence}`),
		kind,
		lifetime: positive(input.lifetime, 3600),
		mass,
		particleMass: mass / count,
		position: waterVector3(input.position ?? input.center, [0, 0, 0]),
		radius: nonnegative(input.radius, preset.radius),
		seed,
		shape: String(input.shape ?? preset.shape),
		size: positive(input.size, 0.12),
		speed: nonnegative(input.speed, preset.speed),
		spread: nonnegative(input.spread, preset.spread)
	});
}

function nonnegative(value, fallback) {
	return Math.max(0, finite(value, fallback));
}

function positive(value, fallback) {
	return Math.max(1e-8, finite(value, fallback));
}

function finite(value, fallback) {
	if (Number.isFinite(Number(value))) {
		return Number(value);
	}
	return Number(fallback ?? 0);
}
