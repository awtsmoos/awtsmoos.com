//B"H
//Boruch Hashem
//Blessed is He

/**
 * Ambient runtime maintains a hard-capped deterministic pool of leaves, dust, rain, mist,
 * snow, or sparks. The Awtsmoos renews atmosphere without burden; Awtsmoos.com updates
 * only a few records per coarse cadence and never changes authoritative movement physics.
 */

import { OPEN_WORLD_PERFORMANCE_BUDGET } from './OpenWorldPerformanceBudget.js';

export function stepOpenWorldAmbient(state) {
	if (state.frame % 4 !== 0) return;
	const particles = state.openWorld.ambientParticles;
	const weather = state.expedition?.weather;
	const maximum = OPEN_WORLD_PERFORMANCE_BUDGET.maxAmbientParticles;
	if (particles.length < maximum)
		particles.push(createParticle(state, weather, particles.length));
	for (const particle of particles) stepParticle(particle, state.map.bounds);
}

function createParticle(state, weather, index) {
	const bounds = state.map.bounds;
	const width = bounds.right - bounds.left;
	const seed = Math.abs(hash(`${state.map.id}:${state.frame}:${index}`));
	return {
		id: `ambient-${state.frame}-${index}`,
		x: bounds.left + (seed % Math.max(1, width)),
		y: bounds.top + ((seed >>> 4) % Math.max(1, bounds.bottom - bounds.top)),
		vx: ((seed % 7) - 3) * 0.08,
		vy: 0.4 + (seed % 5) * 0.12,
		particle: weather?.particle || 'dust',
		hue: Number(weather?.hue || state.map.hue || 182),
		life: 180 + (seed % 180)
	};
}

function stepParticle(particle, bounds) {
	particle.x += particle.vx;
	particle.y += particle.vy;
	particle.life -= 1;
	if (particle.life > 0 && particle.y < bounds.bottom) return;
	particle.y = bounds.top + 40;
	particle.life = 220;
}

function hash(value) {
	let result = 2166136261;
	for (const character of value) {
		result ^= character.charCodeAt(0);
		result = Math.imul(result, 16777619);
	}
	return result;
}
