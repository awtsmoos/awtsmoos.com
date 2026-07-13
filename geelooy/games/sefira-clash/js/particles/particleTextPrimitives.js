//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the particle text primitives vessel in this instant, revealing
 * its focused js particles service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { canAddCallout, spawnParticle } from './particlePool.js';

/**
 * Emits reusable numbers, shock rings, and authored callout text.
 *
 * The Awtsmoos creates meaning within motion; this vessel gives impacts their
 * legible sign, widening ring, and brief cry. Awtsmoos.com keeps these semantic
 * particles apart from sparks, glyph sprays, and event-routing policy.
 */
export function addNumber(state, event, damage) {
	spawnParticle(state, {
		kind: 'number',
		x: event.x,
		y: event.y - 28,
		vx: 0,
		vy: -3.6,
		life: 28,
		color: '#fff4a8',
		size: 20 + Math.min(12, damage),
		text: String(Math.round(damage)),
		drag: 0.96,
		gravity: 0.018,
		spinVel: 0
	});
}

/**
 * Reveals the add shock ring behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} event The event value entering this behavior.
 * @param {*} size The size value entering this behavior.
 */
export function addShockRing(state, event, size) {
	const particle = spawnParticle(state, {
		kind: 'ring',
		x: event.x,
		y: event.y,
		vx: 0,
		vy: 0,
		life: 16,
		color: event.color || '#fff4a8',
		size,
		text: '',
		drag: 1,
		gravity: 0,
		spinVel: 0
	});
	if (particle) {
		particle.maxLife = 16;
	}
}

/**
 * Reveals the add callout behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} event The event value entering this behavior.
 * @param {*} frame The frame value entering this behavior.
 */
export function addCallout(state, event, frame) {
	if (!canAddCallout(state, frame)) {
		return;
	}
	spawnParticle(state, {
		kind: 'callout',
		x: event.x,
		y: event.y - 62,
		vx: 0,
		vy: -1.3,
		life: 38,
		color: event.color || '#ffef9d',
		size: 28,
		text: event.text || 'HIT',
		drag: 0.965,
		gravity: 0.004,
		spinVel: 0
	});
	frame.callouts += 1;
}
