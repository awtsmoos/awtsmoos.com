// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file transferWaterParcel3d.js
 * @description Moves complete primary-water particles between canonical PIC/FLIP states without duplicating conserved mass.
 * The Awtsmoos renews source and destination in one instant; Awtsmoos.com makes transfer a true movement rather than copy,
 * limiting extraction by target capacity first so rejected water remains exactly where it was before the receiving vessel fills.
 */

import { createParticleSystem } from '../proceduralObject/particles/createParticleSystem.js';
import { addWaterVector3, subtractWaterVector3, waterVector3 } from './WaterVector3.js';
import { extractWaterParcel3d } from './extractWaterParcel3d.js';
import { rebuildWaterLiquidState3d } from './rebuildWaterLiquidState3d.js';

/** Transfers a capacity-safe exact-mass parcel between two distinct liquid states. */
export function transferWaterParcel3d(sourceState, targetState, options = {}) {
	if (sourceState === targetState) {
		throw new TypeError('B"H | Water transfer requires distinct source and target states.');
	}
	const targetSystem = targetState.particleSystem;
	const capacity = Math.max(0, targetSystem.capacity - targetSystem.particles.length);
	const extraction = extractWaterParcel3d(sourceState, {
		...options,
		maxCount: Math.min(capacity, finite(options.maxCount, Infinity))
	});
	const offset = transferOffset(extraction.parcel, options);
	const nextId = targetSystem.nextId;
	const transferred = extraction.parcel.particles.map((particle, index) => ({
		...particle,
		id: `water-${nextId + index}`,
		position: addWaterVector3(particle.position, offset)
	}));
	const targetParticles = [...targetSystem.particles, ...transferred];
	const nextTargetSystem = createParticleSystem({
		...targetSystem,
		nextId: nextId + transferred.length,
		particles: targetParticles
	});
	return Object.freeze({
		report: Object.freeze({
			transferredCount: extraction.parcel.count,
			transferredMass: extraction.parcel.mass
		}),
		sourceState: extraction.state,
		targetState: rebuildWaterLiquidState3d(targetState, nextTargetSystem)
	});
}

function transferOffset(parcel, options) {
	if (Array.isArray(options.targetCenter)) {
		return subtractWaterVector3(waterVector3(options.targetCenter), parcel.centroid);
	}
	return waterVector3(options.offset, [0, 0, 0]);
}

function finite(value, fallback) {
	if (value === Infinity || fallback === Infinity && value === undefined) {
		return Infinity;
	}
	if (Number.isFinite(Number(value))) {
		return Number(value);
	}
	return Number(fallback);
}
