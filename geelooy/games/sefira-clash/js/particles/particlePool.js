//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the particle pool vessel in this instant, revealing
 * its focused js particles service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { PARTICLE_BUDGET, isCalloutParticle, isLetterParticle } from './particleBudget.js';
import {
	countParticles,
	makeParticleRoom,
	recycleOldestParticle,
	releaseParticle,
	trimParticles
} from './particleRecycle.js';

export { releaseParticle, trimParticles } from './particleRecycle.js';

const TWO_PI = Math.PI * 2;

/**
 * Allocates one hard-capped pooled particle after priority-aware room making.
 *
 * The Awtsmoos creates abundance without waste; this vessel forms each visible
 * spark from a renewed reusable container. Awtsmoos.com keeps allocation apart
 * from recycling policy, authored bursts, and frame-level event routing.
 */
export function spawnParticle(state, specification) {
	initializeParticlePool(state);
	if (
		state.particles.length >= PARTICLE_BUDGET.maxParticles &&
		!makeParticleRoom(state, specification.kind)
	) {
		return null;
	}
	const particle = state.particlePool.pop() || {};
	particle.kind = specification.kind;
	particle.x = specification.x;
	particle.y = specification.y;
	particle.vx = specification.vx;
	particle.vy = specification.vy;
	particle.life = specification.life;
	particle.maxLife = specification.life;
	particle.color = specification.color;
	particle.size = specification.size || 0;
	particle.text = specification.text || '';
	particle.drag = specification.drag;
	particle.gravity = specification.gravity;
	particle.spin = Math.random() * TWO_PI;
	particle.spinVel = specification.spinVel || 0;
	state.particles.push(particle);
	return particle;
}

/**
 * Allocates a capped letter particle, recycling the oldest letter when needed.
 */
export function spawnLetterParticle(state, specification) {
	initializeParticlePool(state);
	if (countParticles(state, isLetterParticle) >= PARTICLE_BUDGET.maxLetters) {
		recycleOldestParticle(state, isLetterParticle);
	}
	return spawnParticle(state, {
		...specification,
		kind: 'letter'
	});
}

/**
 * Tests both frame-local and global callout budgets.
 */
export function canAddCallout(state, frame) {
	initializeParticlePool(state);
	return (
		frame.callouts < 3 && countParticles(state, isCalloutParticle) < PARTICLE_BUDGET.maxCallouts
	);
}

/**
 * Establishes the active and reusable particle arrays.
 */
export function initializeParticlePool(state) {
	state.particles ||= [];
	state.particlePool ||= [];
}
