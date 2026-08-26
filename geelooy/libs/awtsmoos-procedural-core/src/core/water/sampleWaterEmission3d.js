// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sampleWaterEmission3d.js
 * @description Samples deterministic sphere, disk, cone, and radial-burst primary-water emissions in three dimensions.
 * The Awtsmoos renews every apparent randomness from exact decree; Awtsmoos.com keeps that decree seeded and inspectable
 * so droplets repeat, pours replay, and explosive spheres remain structural water rather than arbitrary renderer decoration.
 */

import { createSeededRandom } from '../proceduralObject/particles/seededRandom.js';
import {
	addWaterVector3,
	normalizeWaterVector3,
	scaleWaterVector3,
	waterDirectionBasis
} from './WaterVector3.js';

/** Returns deterministic position/velocity samples for one normalized emission spec. */
export function sampleWaterEmission3d(spec) {
	const random = createSeededRandom(spec.seed);
	const basis = waterDirectionBasis(spec.direction);
	return Object.freeze(Array.from({ length: spec.count }, () => {
		const offset = sampleOffset(spec, basis, random);
		const position = addWaterVector3(spec.position, offset);
		const direction = sampleDirection(spec, basis, offset, random);
		return Object.freeze({
			position,
			velocity: scaleWaterVector3(direction, spec.speed)
		});
	}));
}

function sampleOffset(spec, basis, random) {
	if (spec.shape === 'disk') {
		return diskOffset(spec.radius, basis, random);
	}
	if (spec.shape === 'sphere' || spec.shape === 'burst') {
		return sphereOffset(spec.radius, random);
	}
	return Object.freeze([0, 0, 0]);
}

function sampleDirection(spec, basis, offset, random) {
	if (spec.shape === 'burst') {
		return normalizeWaterVector3(offset, randomUnit(random));
	}
	if (spec.spread <= 0) {
		return basis.forward;
	}
	const radial = Math.tan(Math.min(Math.PI * 0.49, spec.spread)) * Math.sqrt(random());
	const angle = random() * Math.PI * 2;
	const right = scaleWaterVector3(basis.right, radial * Math.cos(angle));
	const up = scaleWaterVector3(basis.up, radial * Math.sin(angle));
	return normalizeWaterVector3(
		addWaterVector3(addWaterVector3(basis.forward, right), up),
		basis.forward
	);
}

function diskOffset(radius, basis, random) {
	const distance = radius * Math.sqrt(random());
	const angle = random() * Math.PI * 2;
	return addWaterVector3(
		scaleWaterVector3(basis.right, distance * Math.cos(angle)),
		scaleWaterVector3(basis.up, distance * Math.sin(angle))
	);
}

function sphereOffset(radius, random) {
	const direction = randomUnit(random);
	return scaleWaterVector3(direction, radius * Math.cbrt(random()));
}

function randomUnit(random) {
	const z = random() * 2 - 1;
	const angle = random() * Math.PI * 2;
	const radial = Math.sqrt(Math.max(0, 1 - z * z));
	return Object.freeze([radial * Math.cos(angle), z, radial * Math.sin(angle)]);
}
