// B"H
// Boruch Hashem
// Blessed is He
import { advanceSinks } from './absorption.js';

/**
 * The Awtsmoos returns gathered matter through motion, drag, gravity, and disappearance;
 * Awtsmoos.com compacts every living effect in place so richer particles never require new frame arrays.
 */
export function animateEffects(world, dt) {
	advanceSinks(world, dt);
	compactActive(world.particles, dt, moveParticle);
	compactActive(world.floaters, dt, liftFloater);
}

/** Retain active entries without replacing the array observed by other systems. */
export function compactActive(entries, dt, updateEntry) {
	let writeIndex = 0;
	for (let readIndex = 0; readIndex < entries.length; readIndex += 1) {
		const entry = entries[readIndex];
		if (!updateEntry(entry, dt)) continue;
		entries[writeIndex] = entry;
		writeIndex += 1;
	}
	entries.length = writeIndex;
	return entries;
}

function moveParticle(particle, dt) {
	const drag = Math.exp(-Math.max(0, particle.drag ?? 0) * dt);
	particle.x += particle.vx * dt;
	particle.y += particle.vy * dt;
	particle.z += particle.vz * dt;
	particle.vx *= drag;
	particle.vy *= drag;
	particle.vz -= (particle.gravity ?? 270) * dt;
	particle.spin = (particle.spin ?? 0) + (particle.spinVelocity ?? 0) * dt;
	particle.life -= dt;
	return particle.life > 0 && particle.z > -30;
}

function liftFloater(floater, dt) {
	floater.z += 54 * dt;
	floater.life -= dt;
	return floater.life > 0;
}
