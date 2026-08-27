// B"H
// Boruch Hashem
// Blessed is He
/** Forces are explicit vectors; no invisible engine hand moves the particles. */

import { normalizeVector, scaleVector } from "../geometry/vectorMath.js";
import { sampleField } from "../fields/sampleField.js";
import { sampleParticleTurbulence } from "./particleTurbulence.js";

function subtract(left, right) {
	return left.map((value, axis) => value - right[axis]);
}

function cross(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

function directionalForce(vector, strength, mass = 1) {
	return normalizeVector(vector).map(value => value * strength * mass);
}

function centerForce(force, particle, outward) {
	const center = force.center ?? [0, 0, 0];
	const delta = outward
		? subtract(particle.position, center)
		: subtract(center, particle.position);
	const distance = Math.max(1e-9, Math.hypot(...delta));
	const falloff = Math.max(0, Number(force.falloff ?? 1));
	const softening = Math.max(1e-9, Number(force.softening ?? 1));
	const strength = Number(force.strength ?? 1) * particle.mass
		/ (softening + distance ** falloff);
	return directionalForce(delta, strength);
}

/** Samples one declared force in O(1), or delegates to a field sampler. */
export function sampleParticleForce(force, particle, context = {}) {
	const type = force.type ?? "gravity";
	if (type === "gravity") {
		return (force.vector ?? [0, -9.81, 0]).map(value => value * particle.mass);
	}
	if (type === "drag") {
		return particle.velocity.map(value => -value * Number(force.coefficient ?? 0.1));
	}
	if (type === "wind") {
		const relative = subtract(force.vector ?? [0, 0, 0], particle.velocity);
		return relative.map(value => value * Number(force.coefficient ?? 0.4));
	}
	if (type === "buoyancy") {
		return directionalForce(
			force.direction ?? [0, 1, 0],
			Number(force.strength ?? 9.81) * Number(force.displacedDensity ?? 1),
			particle.mass
		);
	}
	if (type === "turbulence") {
		return sampleParticleTurbulence(particle.position, {
			...force,
			time: context.time,
			seed: force.seed ?? context.seed
		}).map(value => value * Number(force.strength ?? 1) * particle.mass);
	}
	if (type === "field") {
		return sampleField(force.field, { ...context, position: particle.position });
	}
	if (type === "radial") return centerForce(force, particle, true);
	if (type === "attractor") return centerForce(force, particle, false);
	if (type === "vortex") {
		const center = force.center ?? [0, 0, 0];
		const radius = subtract(particle.position, center);
		const tangent = cross(normalizeVector(force.axis ?? [0, 1, 0]), radius);
		return directionalForce(tangent, Number(force.strength ?? 1), particle.mass);
	}
	throw new TypeError(`Unsupported particle force: ${type}`);
}

/** Adds a declared force stack in canonical array order. */
export function sumParticleForces(forces, particle, context = {}) {
	const total = [0, 0, 0];
	for (const force of forces) {
		const sampled = sampleParticleForce(force, particle, context);
		for (let axis = 0; axis < 3; axis += 1) total[axis] += sampled[axis];
	}
	return total;
}
