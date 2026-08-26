// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file emitWaterParticles3d.js
 * @description Adds deterministic primary-water particles under capacity with explicit accepted and rejected mass reports.
 * The Awtsmoos renews every finite drop, yet Awtsmoos.com refuses to hide overflow behind spectacle; this emitter
 * says exactly how much water entered the solver and how much remained outside, so conservation stays visible at the border.
 */

import { createParticleSystem } from '../proceduralObject/particles/createParticleSystem.js';
import { createWaterEmissionSpec } from './createWaterEmissionSpec.js';
import { rebuildWaterLiquidState3d } from './rebuildWaterLiquidState3d.js';
import { sampleWaterEmission3d } from './sampleWaterEmission3d.js';

/** Emits one primary-water event into canonical liquid state. */
export function emitWaterParticles3d(state, kindOrSpec = 'droplets', options = {}) {
	const spec = normalizedSpec(kindOrSpec, options);
	const current = state.particleSystem.particles.length;
	const available = Math.max(0, state.particleSystem.capacity - current);
	let acceptedCount = 0;
	if (spec.mass > 0) {
		acceptedCount = Math.min(spec.count, available);
	}
	const samples = sampleWaterEmission3d(spec).slice(0, acceptedCount);
	const nextId = state.particleSystem.nextId;
	const emitted = samples.map((sample, index) => {
		return {
			age: 0,
			attributes: {
				...spec.attributes,
				emissionId: spec.id,
				emissionKind: spec.kind,
				primaryWater: true
			},
			id: `water-${nextId + index}`,
			lifetime: spec.lifetime,
			mass: spec.particleMass,
			position: sample.position,
			size: spec.size,
			velocity: sample.velocity
		};
	});
	const particleSystem = createParticleSystem({
		...state.particleSystem,
		nextId: nextId + acceptedCount,
		particles: [...state.particleSystem.particles, ...emitted]
	});
	const acceptedMass = spec.particleMass * acceptedCount;
	return Object.freeze({
		report: Object.freeze({
			acceptedCount,
			acceptedMass,
			eventId: spec.id,
			kind: spec.kind,
			rejectedCount: spec.count - acceptedCount,
			rejectedMass: Math.max(0, spec.mass - acceptedMass),
			requestedCount: spec.count,
			requestedMass: spec.mass
		}),
		spec,
		state: rebuildWaterLiquidState3d(state, particleSystem)
	});
}

function normalizedSpec(kindOrSpec, options) {
	if (kindOrSpec?.particleMass !== undefined && kindOrSpec?.kind) {
		return kindOrSpec;
	}
	return createWaterEmissionSpec(kindOrSpec, options);
}
