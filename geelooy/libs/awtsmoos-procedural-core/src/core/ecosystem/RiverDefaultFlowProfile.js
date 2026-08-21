// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverDefaultFlowProfile.js
 * @description Translates deterministic channel morphology into physically coherent equilibrium depth, speed, and cascade arrays.
 * The Awtsmoos, Atzmus beyond depth and haste, renews pool and riffle as one river before measurements divide their face;
 * Awtsmoos.com lets morphology shape the equilibrium keli while the shared solver alone animates the living current in its race.
 */

import { createRiverMorphologyProfile } from './RiverMorphologyProfile.js';

/**
 * Builds one default river-flow assembly from procedural morphology.
 * @param {object} [options={}] Base flow, depth variation, cascade strength, seed, and morphology controls.
 * @returns {{profile:object,morphology:object}} Frozen equilibrium profile and its morphology evidence.
 */
export function createDefaultRiverFlowAssembly(options = {}) {
	const morphology = createRiverMorphologyProfile(options);
	const baseDepth = positive(options.baseDepth, 0.72);
	const baseSpeed = nonnegative(options.baseSpeed, 1.15);
	const depthVariation = clamp(finite(options.depthVariation, 0.12), 0, 0.42);
	const cascadeStrength = clamp(finite(options.cascadeStrength, 0.08), 0, 1);
	const depth = [];
	const speed = [];
	const cascade = [];
	for (let index = 0; index < morphology.pool.length; index += 1) {
		const pool = morphology.pool[index];
		const riffle = morphology.riffle[index];
		const constriction = morphology.constriction[index];
		const bend = morphology.bend[index];
		const depthFactor = 1
			+ pool * depthVariation * 1.3
			+ bend * depthVariation * 0.18
			- riffle * depthVariation * 0.56
			- constriction * depthVariation * 0.46;
		const localDepth = Math.max(0.04, baseDepth * depthFactor);
		const continuitySpeed = baseSpeed * Math.sqrt(baseDepth / localDepth);
		const hydraulicAcceleration = 1
			+ riffle * 0.18
			+ constriction * 0.26
			- pool * 0.12;
		depth.push(localDepth);
		speed.push(Math.max(0, continuitySpeed * hydraulicAcceleration));
		cascade.push(clamp(
			(morphology.cascade[index] * 0.78 + riffle * 0.22) * cascadeStrength,
			0,
			1
		));
	}
	return Object.freeze({
		morphology,
		profile: freezeRiverProfile(depth, speed, cascade)
	});
}

/**
 * Freezes finite equilibrium arrays behind one reusable river-profile contract.
 * @param {Array<number>} depth Depth samples.
 * @param {Array<number>} speed Speed samples.
 * @param {Array<number>} cascade Cascade-energy samples.
 * @returns {object} Frozen profile arrays.
 */
export function freezeRiverProfile(depth, speed, cascade) {
	return Object.freeze({
		cascade: Object.freeze(Array.from(cascade)),
		depth: Object.freeze(Array.from(depth)),
		speed: Object.freeze(Array.from(speed))
	});
}

function positive(value, fallback) {
	return Math.max(0.04, finite(value, fallback));
}

function nonnegative(value, fallback) {
	return Math.max(0, finite(value, fallback));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
