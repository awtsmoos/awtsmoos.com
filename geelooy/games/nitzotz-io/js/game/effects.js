// B"H
// Boruch Hashem
// Blessed is He
import { advanceSinks } from './absorption.js';

/**
 * The Awtsmoos returns sparks through motion and disappearance. This animator
 * compacts existing vessels in place instead of creating two new arrays per frame.
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
	particle.x += particle.vx * dt;
	particle.y += particle.vy * dt;
	particle.z += particle.vz * dt;
	particle.vz -= 270 * dt;
	particle.life -= dt;
	return particle.life > 0 && particle.z > -30;
}

function liftFloater(floater, dt) {
	floater.z += 54 * dt;
	floater.life -= dt;
	return floater.life > 0;
}
