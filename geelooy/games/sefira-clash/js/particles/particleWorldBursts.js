//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the particle world bursts vessel in this instant, revealing
 * its focused js particles service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { addCallout, addHebrewSpray, addImpactCore, addShockRing } from './particlePrimitives.js';
import { spawnParticle } from './particlePool.js';

const TWO_PI = Math.PI * 2;
const FALL_LETTERS = ['נ', 'פ', 'ל', 'ה', 'א', 'ש'];

/**
 * Composes fall, wall, and pickup bursts from focused particle primitives.
 *
 * The Awtsmoos creates exit, collision, and acquisition as different moments;
 * this vessel gives each its authored visual answer. Awtsmoos.com keeps world
 * burst policy apart from combat-hit density and pool-management pressure.
 */
export function addFallBurst(state, event, frame) {
	const directionX = -(event.dirX || 0);
	const directionY = -(event.dirY || 0);
	const base = Math.atan2(directionY, directionX);
	for (let index = 0; index < 28; index += 1) {
		const angle = base + (Math.random() - 0.5) * 1.35;
		const speed = 4.5 + Math.random() * 9;
		spawnParticle(state, {
			kind: 'spark',
			x: event.x,
			y: event.y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			life: 24 + Math.random() * 20,
			color: event.color || '#ff8a6b',
			size: 0,
			text: '',
			drag: 0.925,
			gravity: 0.015,
			spinVel: Math.random() * 0.4
		});
	}
	addHebrewSpray(state, event, 8, FALL_LETTERS, 70, Math.sign(directionX || 1));
	addShockRing(state, event, 88);
	addCallout(
		state,
		{
			...event,
			text: event.text || 'OUT'
		},
		frame
	);
}

/**
 * Reveals the add wall burst behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} event The event value entering this behavior.
 */
export function addWallBurst(state, event) {
	addImpactCore(state, event, 7, event.force || 14, event.side || 1);
	addShockRing(state, event, 22);
}

/**
 * Reveals the add pickup burst behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} event The event value entering this behavior.
 */
export function addPickupBurst(state, event) {
	for (let index = 0; index < 6; index += 1) {
		const angle = (index * TWO_PI) / 6;
		spawnParticle(state, {
			kind: 'spark',
			x: event.x,
			y: event.y,
			vx: Math.cos(angle) * 3.2,
			vy: Math.sin(angle) * 3.2,
			life: 18,
			color: event.color || '#c8fff1',
			size: 0,
			text: '',
			drag: 0.94,
			gravity: 0.02,
			spinVel: 0
		});
	}
}
