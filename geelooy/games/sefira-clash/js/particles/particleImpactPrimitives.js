//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the particle impact primitives vessel in this instant, revealing
 * its focused js particles service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { spawnLetterParticle, spawnParticle } from './particlePool.js';

const TWO_PI = Math.PI * 2;

/**
 * Emits reusable spark, Hebrew-glyph, and slash primitives.
 *
 * The Awtsmoos creates letters and light from one source; this vessel reveals
 * their physical burst motions. Awtsmoos.com keeps impact geometry separate
 * from text, rings, callouts, and event-level policy.
 */
export function addImpactCore(state, event, count, force, side) {
	for (let index = 0; index < count; index += 1) {
		const angle = -0.25 * side + (Math.random() - 0.5) * 2.7;
		const speed = 2.6 + Math.random() * 5.2 + force * 0.04;
		spawnParticle(state, {
			kind: 'spark',
			x: event.x,
			y: event.y,
			vx: Math.cos(angle) * speed * side,
			vy: Math.sin(angle) * speed,
			life: 10 + Math.random() * 10,
			color: event.color || '#f8d66a',
			size: 0,
			text: '',
			drag: 0.91,
			gravity: 0.035,
			spinVel: Math.random() * 0.4
		});
	}
}

/**
 * Reveals the add hebrew spray behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} event The event value entering this behavior.
 * @param {*} count The count value entering this behavior.
 * @param {*} letters The letters value entering this behavior.
 * @param {*} force The force value entering this behavior.
 * @param {*} side The side value entering this behavior.
 */
export function addHebrewSpray(state, event, count, letters, force, side) {
	for (let index = 0; index < count; index += 1) {
		const letter =
			event.letter && index === 0
				? event.letter
				: letters[(index + Math.floor(Math.random() * letters.length)) % letters.length];
		const angle = Math.random() * TWO_PI;
		const speed = 1.5 + Math.random() * 3.8 + force * 0.018;
		spawnLetterParticle(state, {
			x: event.x + rand(13),
			y: event.y + rand(10),
			vx: Math.cos(angle) * speed + side,
			vy: Math.sin(angle) * speed - 1.8,
			life: 20 + Math.random() * 14,
			color: event.color || '#ffe28a',
			size: 17 + Math.random() * 14,
			text: letter,
			drag: 0.95,
			gravity: 0.018,
			spinVel: rand(0.12)
		});
	}
}

/**
 * Reveals the add slash fan behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} event The event value entering this behavior.
 * @param {*} count The count value entering this behavior.
 * @param {*} side The side value entering this behavior.
 */
export function addSlashFan(state, event, count, side) {
	for (let index = 0; index < count; index += 1) {
		spawnParticle(state, {
			kind: 'slash',
			x: event.x + rand(26),
			y: event.y + rand(18),
			vx: side * (1.3 + Math.random() * 2.3),
			vy: rand(1.2),
			life: 10 + Math.random() * 7,
			color: event.color || '#fff2a8',
			size: 24 + Math.random() * 18,
			text: '',
			drag: 0.94,
			gravity: 0.02,
			spinVel: rand(0.18)
		});
	}
}

function rand(range) {
	return (Math.random() * 2 - 1) * range;
}
