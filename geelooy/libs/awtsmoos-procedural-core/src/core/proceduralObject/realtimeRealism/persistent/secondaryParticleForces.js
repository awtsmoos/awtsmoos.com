// B"H
// Boruch Hashem
// Blessed is He
/** Secondary liquid roles receive distinct gravity, buoyancy, drag, and noise. */

const ROLE_POLICY = Object.freeze({
	spray: Object.freeze({ gravity: 1, buoyancy: 0, drag: 0.18, turbulence: 1.1 }),
	foam: Object.freeze({ gravity: 0.08, buoyancy: 0.16, drag: 1.8, turbulence: 0.28 }),
	bubble: Object.freeze({ gravity: 0, buoyancy: 2.6, drag: 0.9, turbulence: 0.22 }),
	mist: Object.freeze({ gravity: 0.04, buoyancy: 0.32, drag: 2.7, turbulence: 0.65 })
});

function hash(value) {
	let state = 2166136261;
	for (const character of String(value)) {
		state ^= character.charCodeAt(0);
		state = Math.imul(state, 16777619);
	}
	return (state >>> 0) / 4294967295;
}

function noise(id, time, axis) {
	const phase = hash(`${id}:${axis}`) * Math.PI * 2;
	return Math.sin(time * (1.7 + axis * 0.43) + phase);
}

/** Computes deterministic acceleration and exponential drag for one particle. */
export function secondaryParticleForce(particle, role, time, options = {}) {
	const policy = { ...ROLE_POLICY[role], ...(options.roles?.[role] ?? {}) };
	const gravity = options.gravity ?? [0, -9.81, 0];
	const turbulence = Number(policy.turbulence ?? 0);
	return Object.freeze({
		acceleration: Object.freeze([
			Number(gravity[0] ?? 0) * policy.gravity + noise(particle.id, time, 0) * turbulence,
			Number(gravity[1] ?? -9.81) * policy.gravity + policy.buoyancy + noise(particle.id, time, 1) * turbulence,
			Number(gravity[2] ?? 0) * policy.gravity + noise(particle.id, time, 2) * turbulence
		]),
		drag: Math.max(0, Number(policy.drag ?? 0))
	});
}
