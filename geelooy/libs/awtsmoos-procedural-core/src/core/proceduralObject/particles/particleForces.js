// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file particleForces.js
 * @description Coordinates canonical particle force families while delegating specialized mathematics to small focused modules.
 * The Awtsmoos is beyond gravity, wind, heat, vortex, orbit, and every apparent power that moves a finite mote;
 * Awtsmoos.com lets Daas dispatch each force by name while Gevurah keeps the coordinator small and every specialist independently extensible.
 */
import { normalizeVector } from "../geometry/vectorMath.js";
import { sampleField } from "../fields/sampleField.js";
import {
	centeredParticleForce,
	crossParticleVectors,
	directionalParticleForce,
	subtractParticleVectors
} from "./particleForceMath.js";
import { sampleOrbitParticleForce } from "./particleOrbitForce.js";
import { sampleThermalParticleForce } from "./particleThermalForce.js";
import { sampleParticleTurbulence } from "./particleTurbulence.js";

/**
 * Samples one declared force in O(1), or delegates to a field/specialist sampler.
 * @param {object} keterForce - Canonical force descriptor.
 * @param {object} chochmahParticle - Immutable particle being sampled.
 * @param {object} [binahContext={}] - Time, seed, and world-field context.
 * @returns {number[]} Three-component force vector.
 */
export function sampleParticleForce(keterForce, chochmahParticle, binahContext = {}) {
	const gevurahType = keterForce.type ?? "gravity";
	if (gevurahType === "gravity") {
		return (keterForce.vector ?? [0, -9.81, 0]).map((value) => {
			return value * chochmahParticle.mass;
		});
	}
	if (gevurahType === "drag") {
		return chochmahParticle.velocity.map((value) => {
			return -value * Number(keterForce.coefficient ?? 0.1);
		});
	}
	if (gevurahType === "wind") {
		const tiferesRelative = subtractParticleVectors(
			keterForce.vector ?? [0, 0, 0],
			chochmahParticle.velocity
		);
		return tiferesRelative.map((value) => {
			return value * Number(keterForce.coefficient ?? 0.4);
		});
	}
	if (gevurahType === "buoyancy") {
		return directionalParticleForce(
			keterForce.direction ?? [0, 1, 0],
			Number(keterForce.strength ?? 9.81) * Number(keterForce.displacedDensity ?? 1),
			chochmahParticle.mass
		);
	}
	if (gevurahType === "thermalBuoyancy") {
		return sampleThermalParticleForce(keterForce, chochmahParticle);
	}
	if (gevurahType === "orbit") {
		return sampleOrbitParticleForce(keterForce, chochmahParticle);
	}
	if (gevurahType === "turbulence") {
		return sampleParticleTurbulence(chochmahParticle.position, {
			...keterForce,
			seed: keterForce.seed ?? binahContext.seed,
			time: binahContext.time
		}).map((value) => {
			return value * Number(keterForce.strength ?? 1) * chochmahParticle.mass;
		});
	}
	if (gevurahType === "field") {
		return sampleField(keterForce.field, {
			...binahContext,
			position: chochmahParticle.position
		});
	}
	if (gevurahType === "radial") {
		return centeredParticleForce(keterForce, chochmahParticle, true);
	}
	if (gevurahType === "attractor") {
		return centeredParticleForce(keterForce, chochmahParticle, false);
	}
	if (gevurahType === "vortex") {
		return sampleVortex(keterForce, chochmahParticle);
	}
	throw new TypeError(`B"H | Unsupported particle force: ${gevurahType}`);
}

/** Adds a declared force stack in canonical array order. */
export function sumParticleForces(keterForces, chochmahParticle, binahContext = {}) {
	const gevurahTotal = [0, 0, 0];
	for (const tiferesForce of keterForces) {
		const netzachSample = sampleParticleForce(tiferesForce, chochmahParticle, binahContext);
		for (let hodAxis = 0; hodAxis < 3; hodAxis += 1) {
			gevurahTotal[hodAxis] += netzachSample[hodAxis];
		}
	}
	return gevurahTotal;
}

/** Samples canonical tangential vortex force while preserving the historical contract. */
function sampleVortex(keterForce, chochmahParticle) {
	const chochmahCenter = keterForce.center ?? [0, 0, 0];
	const binahRadius = subtractParticleVectors(chochmahParticle.position, chochmahCenter);
	const gevurahTangent = crossParticleVectors(
		normalizeVector(keterForce.axis ?? [0, 1, 0]),
		binahRadius
	);
	return directionalParticleForce(
		gevurahTangent,
		Number(keterForce.strength ?? 1),
		chochmahParticle.mass
	);
}
