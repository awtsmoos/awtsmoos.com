// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file applyWaterImpulse3d.js
 * @description Applies localized radial and upward momentum to primary liquid particles without changing conserved mass.
 * The Awtsmoos renews force without confusing force with substance; Awtsmoos.com lets splash and explosion reveal motion
 * while every primary particle keeps its finite mass, so spectacle descends from conservation instead of replacing the law.
 */

import { createParticleSystem } from '../proceduralObject/particles/createParticleSystem.js';
import {
	addWaterVector3,
	normalizeWaterVector3,
	scaleWaterVector3,
	subtractWaterVector3,
	waterVector3
} from './WaterVector3.js';
import { rebuildWaterLiquidState3d } from './rebuildWaterLiquidState3d.js';

/** Applies one mass-preserving splash/explosion impulse to canonical liquid state. */
export function applyWaterImpulse3d(state, options = {}) {
	const center = waterVector3(options.center ?? options.position, [0, 0, 0]);
	const radius = Math.max(1e-8, finiteNumber(options.radius, 1));
	const impulse = Math.max(0, finiteNumber(options.impulse ?? options.strength, 4));
	const liftImpulse = Math.max(0, finiteNumber(options.liftImpulse ?? options.lift, 0));
	let affectedCount = 0;
	const particles = state.particleSystem.particles.map(particle => {
		const delta = subtractWaterVector3(particle.position, center);
		const distance = Math.hypot(...delta);
		if (distance > radius) {
			return particle;
		}
		const falloff = Math.pow(Math.max(0, 1 - distance / radius), 2);
		const radial = normalizeWaterVector3(delta, [0, 1, 0]);
		const inverseMass = 1 / Math.max(1e-8, particle.mass);
		const radialVelocity = scaleWaterVector3(radial, impulse * falloff * inverseMass);
		const liftVelocity = [0, liftImpulse * falloff * inverseMass, 0];
		affectedCount += 1;
		return {
			...particle,
			velocity: addWaterVector3(
				addWaterVector3(particle.velocity, radialVelocity),
				liftVelocity
			)
		};
	});
	const particleSystem = createParticleSystem({
		...state.particleSystem,
		particles
	});
	return Object.freeze({
		report: Object.freeze({ affectedCount, impulse, liftImpulse, radius }),
		state: rebuildWaterLiquidState3d(state, particleSystem)
	});
}

function finiteNumber(value, fallback) {
	if (Number.isFinite(Number(value))) {
		return Number(value);
	}
	return fallback;
}
