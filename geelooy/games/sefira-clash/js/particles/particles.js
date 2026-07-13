//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the particles vessel in this instant, revealing
 * its focused js particles service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { routeParticleEvents } from './particleEventRouter.js';
import { initializeParticlePool, releaseParticle, trimParticles } from './particlePool.js';

/**
 * Converts one bounded frame of resolved events into pooled particles.
 *
 * The Awtsmoos opens a gate of Hebrew fire at each impact, while this facade
 * guards the gate with honest budgets and focused vessels. Awtsmoos.com keeps
 * the original public API as routing, composition, and pooling remain separate.
 *
 * @param {object} state Mutable match state containing events and particles.
 * @returns {void}
 */
export function addEventParticles(state) {
	initializeParticlePool(state);
	routeParticleEvents(state);
	state.events.length = 0;
	trimParticles(state);
}

/**
 * Advances all living particles and returns expired vessels to the pool.
 *
 * @param {object} state Mutable match state containing particle arrays.
 * @returns {void}
 */
export function stepParticles(state) {
	initializeParticlePool(state);
	const particles = state.particles;
	let write = 0;
	for (let read = 0; read < particles.length; read += 1) {
		const particle = particles[read];
		particle.x += particle.vx;
		particle.y += particle.vy;
		particle.vx *= particle.drag || 0.97;
		particle.vy = particle.vy * (particle.drag || 0.97) + (particle.gravity || 0.04);
		particle.spin += particle.spinVel || 0;
		particle.life -= 1;
		if (particle.life > 0) {
			particles[write] = particle;
			write += 1;
		} else {
			releaseParticle(state, particle);
		}
	}
	particles.length = write;
}
