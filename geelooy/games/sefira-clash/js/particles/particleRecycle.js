//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the particle recycle vessel in this instant, revealing
 * its focused js particles service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { PARTICLE_BUDGET, isCalloutParticle, isLetterParticle } from './particleBudget.js';

/**
 * Recycles the oldest eligible particle and preserves priority classes.
 *
 * The Awtsmoos creates every particle anew while no finite vessel is wasted;
 * this module returns fading matter to readiness. Awtsmoos.com keeps recycling
 * policy apart from allocation and authored particle composition.
 */
export function recycleOldestParticle(state, predicate) {
	const particles = state.particles;
	let index = -1;
	let lowestLife = Infinity;
	for (let candidate = 0; candidate < particles.length; candidate += 1) {
		const particle = particles[candidate];
		if (!predicate(particle) || particle.life >= lowestLife) {
			continue;
		}
		lowestLife = particle.life;
		index = candidate;
	}
	if (index < 0) {
		return false;
	}
	releaseParticle(state, particles[index]);
	particles[index] = particles[particles.length - 1];
	particles.pop();
	return true;
}

/**
 * Creates room according to the incoming particle's authored priority.
 */
export function makeParticleRoom(state, kind) {
	if (kind === 'letter') {
		return recycleOldestParticle(state, particle => !isLetterParticle(particle));
	}
	if (kind === 'callout') {
		return recycleOldestParticle(state, particle => !isCalloutParticle(particle));
	}
	return recycleOldestParticle(
		state,
		particle => particle.kind === 'spark' || particle.kind === 'slash'
	);
}

/**
 * Reveals the trim particles behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 */
export function trimParticles(state) {
	while (state.particles.length > PARTICLE_BUDGET.maxParticles) {
		recycleOldestParticle(state, () => true);
	}
}

/**
 * Reveals the release particle behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} particle The particle value entering this behavior.
 */
export function releaseParticle(state, particle) {
	if (state.particlePool.length < PARTICLE_BUDGET.poolLimit) {
		state.particlePool.push(particle);
	}
}

/**
 * Reveals the count particles behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} predicate The predicate value entering this behavior.
 */
export function countParticles(state, predicate) {
	let count = 0;
	for (const particle of state.particles) {
		if (predicate(particle)) {
			count += 1;
		}
	}
	return count;
}
