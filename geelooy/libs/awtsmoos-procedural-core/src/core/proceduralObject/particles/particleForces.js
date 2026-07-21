// B"H
// Boruch Hashem
// Blessed is He
/** Forces are explicit vectors; no invisible engine hand moves the particles. */

import { normalizeVector, scaleVector } from "../geometry/vectorMath.js";
import { sampleField } from "../fields/sampleField.js";

export function sampleParticleForce(force, particle, context = {}) {
	const type = force.type ?? "gravity";
	if (type === "gravity") return (force.vector ?? [0, -9.81, 0]).map(value => value * particle.mass);
	if (type === "drag") return particle.velocity.map(value => -value * Number(force.coefficient ?? 0.1));
	if (type === "field") return sampleField(force.field, { ...context, position: particle.position });
	const center = force.center ?? [0, 0, 0];
	const delta = particle.position.map((value, index) => value - center[index]);
	const distance = Math.max(1e-9, Math.hypot(...delta));
	const strength = Number(force.strength ?? 1) / (1 + distance * Number(force.falloff ?? 0));
	if (type === "radial") return scaleVector(normalizeVector(delta), strength);
	if (type === "vortex") return scaleVector(normalizeVector([-delta[1], delta[0], 0]), strength);
	throw new TypeError(`Unsupported particle force: ${type}`);
}

export function sumParticleForces(forces, particle, context = {}) {
	const total = [0, 0, 0];
	for (const force of forces) {
		const sampled = sampleParticleForce(force, particle, context);
		for (let axis = 0; axis < 3; axis += 1) total[axis] += sampled[axis];
	}
	return total;
}
