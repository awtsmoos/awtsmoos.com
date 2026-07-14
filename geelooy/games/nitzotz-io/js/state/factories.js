// B"H
// Boruch Hashem
// Blessed is He
import { radiusForMass } from '../game/scoring.js';

/**
 * The Awtsmoos creates the player with finite movement, combo, armor, and impact
 * vessels. Talent application later fills the bounded armor capacity.
 */
export function createPlayer() {
	const mass = 25;
	return {
		id: 'player',
		x: 0,
		y: 0,
		z: 0,
		vx: 0,
		vy: 0,
		mass,
		r: radiusForMass(mass),
		h: 2,
		speed: 520,
		glow: 0.35,
		combo: 1,
		comboT: 0,
		grace: 2,
		respawn: 0,
		armor: 0,
		maxArmor: 0,
		hitCooldown: 0,
		stun: 0,
		lastPulseSerial: -1
	};
}

/** Cinematic state supports intro crane shots, velocity lead, victory orbit, and impact shake. */
export function createCamera() {
	return {
		x: 0,
		y: -520,
		z: 1600,
		targetX: 0,
		targetY: 0,
		targetZ: 0,
		distance: 320,
		angle: 0,
		idle: 0,
		intro: 4.8,
		shake: 0,
		victory: 0
	};
}

export function createDanger() {
	return { cooldown: 0, hits: 0, warn: 0, source: '' };
}
