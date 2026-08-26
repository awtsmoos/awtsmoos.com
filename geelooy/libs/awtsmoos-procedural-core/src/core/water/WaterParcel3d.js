// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterParcel3d.js
 * @description Freezes an extracted set of primary-water particles into a portable conserved-mass parcel.
 * The Awtsmoos renews water before vessel and destination; Awtsmoos.com lets a finite parcel cross between runtimes
 * without becoming copied water, preserving particle mass and momentum while giving transfer logic an honest object to carry.
 */

import { freezeWaterValue } from './freezeWaterValue.js';

/** Creates one immutable parcel from complete primary particles. */
export function createWaterParcel3d(particles = [], metadata = {}) {
	const frozenParticles = Object.freeze(particles.map(freezeParticle));
	const mass = frozenParticles.reduce((sum, particle) => sum + particle.mass, 0);
	return Object.freeze({
		centroid: weightedCentroid(frozenParticles, mass),
		count: frozenParticles.length,
		mass,
		metadata: freezeWaterValue(metadata),
		particles: frozenParticles,
		schema: 'awtsmoos.water-parcel-3d'
	});
}

function freezeParticle(particle) {
	return Object.freeze({
		...particle,
		attributes: freezeWaterValue(particle.attributes ?? {}),
		position: Object.freeze([...particle.position]),
		velocity: Object.freeze([...particle.velocity])
	});
}

function weightedCentroid(particles, totalMass) {
	if (totalMass <= 0) {
		return Object.freeze([0, 0, 0]);
	}
	const sum = [0, 0, 0];
	for (const particle of particles) {
		for (let axis = 0; axis < 3; axis += 1) {
			sum[axis] += particle.position[axis] * particle.mass;
		}
	}
	return Object.freeze(sum.map(value => value / totalMass));
}
