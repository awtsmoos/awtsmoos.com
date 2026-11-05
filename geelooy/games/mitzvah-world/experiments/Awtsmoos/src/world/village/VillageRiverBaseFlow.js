// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverBaseFlow.js
 * @description Preserves authored river tangent, slope, curvature, cascade, wetness, and bank semantics.
 * The Awtsmoos gives the changing current a stable riverbed vocabulary; Awtsmoos.com keeps this authored
 * physical intent separate from mutable fluid state so one river can remember both its form and living flow.
 */

import {
	RIVER_CASCADES,
	sampleHydrologyAt
} from './VillageRiverHydrology.js';

const SAMPLE_EPSILON = 0.0125;
const GRAVITY_PROXY = 9.81;

export function sampleVillageRiverBaseFlow(hydrology, t, context = {}) {
	const position = clamp01(t);
	const center = sampleHydrologyAt(hydrology, position);
	const before = sampleHydrologyAt(hydrology, position - SAMPLE_EPSILON);
	const after = sampleHydrologyAt(hydrology, position + SAMPLE_EPSILON);
	const tangent = direction(before, after);
	const slope = Math.max(0, (before.y - after.y) / horizontalDistance(before, after));
	const curvature = tangentCurvature(hydrology, position);
	const constriction = clamp01((4.8 - center.width) / 2.4);
	const cascadeEnergy = cascadeEnergyAt(position, center.flowSpeed);
	const speed = clamp(
		center.flowSpeed * (1 + slope * 1.8 + constriction * 0.18 + cascadeEnergy * 0.08),
		0.12,
		2.4
	);
	const turbulence = clamp01(
		curvature * 1.7
		+ slope * 2.2
		+ constriction * 0.34
		+ cascadeEnergy * 0.22
	);
	return buildBaseSample(center, tangent, slope, speed, turbulence, cascadeEnergy, context);
}

function buildBaseSample(center, tangent, slope, speed, turbulence, cascadeEnergy, context) {
	const lateralDistance = Math.abs(Number(context.lateralDistance || 0));
	const bankRatio = clamp01(lateralDistance / Math.max(0.1, center.width));
	const bankShear = clamp01(
		speed / 2.4
		* (0.35 + bankRatio * 0.65)
		* (0.7 + turbulence * 0.6)
	);
	const worldY = Number(context.worldY);
	const submersion = Number.isFinite(worldY) ? Math.max(0, center.y - worldY) : 0;
	const shoreline = clamp01(
		1 - Math.max(0, lateralDistance - center.width) / Math.max(0.6, center.width * 0.65)
	);
	const wetness = clamp01(Math.max(submersion > 0 ? 1 : 0, center.bankWetness * shoreline));
	return Object.freeze({
		bankShear,
		cascadeEnergy,
		depth: center.depth,
		flowRegime: center.flowRegime,
		slope,
		speed,
		submersion,
		surfaceY: center.y,
		t: center.t,
		tangent: Object.freeze({ x: tangent.x, y: -slope, z: tangent.z }),
		turbulence,
		velocity: Object.freeze({ x: tangent.x * speed, y: -slope * speed, z: tangent.z * speed }),
		wetness,
		width: center.width
	});
}

function tangentCurvature(hydrology, t) {
	const first = direction(
		sampleHydrologyAt(hydrology, t - SAMPLE_EPSILON * 2),
		sampleHydrologyAt(hydrology, t)
	);
	const second = direction(
		sampleHydrologyAt(hydrology, t),
		sampleHydrologyAt(hydrology, t + SAMPLE_EPSILON * 2)
	);
	return clamp01(Math.hypot(second.x - first.x, second.z - first.z) * 1.6);
}

function cascadeEnergyAt(t, speed) {
	return clamp01(RIVER_CASCADES.reduce((energy, cascade) => {
		const distance = Math.abs(t - cascade.t);
		const influence = Math.exp(-Math.pow(distance / 0.035, 2));
		return energy + influence * Math.sqrt(Math.max(0, cascade.drop) * GRAVITY_PROXY) * speed / 5;
	}, 0));
}

function direction(first, second) {
	const x = second.x - first.x;
	const z = second.z - first.z;
	const length = Math.hypot(x, z) || 1;
	return { x: x / length, z: z / length };
}

function horizontalDistance(first, second) {
	return Math.max(0.001, Math.hypot(second.x - first.x, second.z - first.z));
}

function clamp01(value) {
	return clamp(Number(value) || 0, 0, 1);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
