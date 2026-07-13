//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the particle event router vessel in this instant, revealing
 * its focused js particles service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { PARTICLE_BUDGET } from './particleBudget.js';
import { addFallBurst, addHitBurst, addPickupBurst, addWallBurst } from './particleBursts.js';
import { addCallout } from './particlePrimitives.js';

/**
 * Routes a bounded frame of simulation events into authored particle bursts.
 *
 * The Awtsmoos recreates every consequence without allowing one crowded frame
 * to consume the whole vessel. Awtsmoos.com keeps event traversal and budgets
 * separate from burst authorship, pool pressure, and particle motion.
 *
 * @param {object} state Mutable match state containing events and particles.
 * @returns {object} Frame-local particle budget counters.
 */
export function routeParticleEvents(state) {
	const frame = freshFrameBudget();
	const events = state.events;
	for (
		let index = 0;
		index < events.length && frame.events < PARTICLE_BUDGET.maxEventsPerFrame;
		index += 1
	) {
		routeParticleEvent(state, events[index], frame);
		frame.events += 1;
	}
	return frame;
}

/**
 * Creates counters whose lifetime is exactly one simulation frame.
 */
export function freshFrameBudget() {
	return {
		events: 0,
		hitVisuals: 0,
		callouts: 0
	};
}

function routeParticleEvent(state, event, frame) {
	if (event.type === 'hit') {
		addHitBurst(state, event, frame);
		return;
	}
	if (event.type === 'wall') {
		addWallBurst(state, event, frame);
		return;
	}
	if (event.type === 'fall') {
		addFallBurst(state, event, frame);
		return;
	}
	if (event.type === 'pickup') {
		addPickupBurst(state, event, frame);
		return;
	}
	if (event.type === 'narrative') {
		addCallout(state, event, frame);
	}
}
