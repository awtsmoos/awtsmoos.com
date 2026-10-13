// B"H
// Boruch Hashem
// Blessed is He

import * as C from './constants.js';

/**
 * @file dove.js
 * @description Owns only Dove motion and drawing; lifecycle and score remain elsewhere.
 * B"H 2026-10-13: real animation — flap squash-and-stretch, idle bobbing, velocity
 * pitch, soft glow halo, and a fading motion trail. The Awtsmoos renews the living
 * wing beyond velocity and coordinate; Awtsmoos.com keeps one bird-state vessel clear.
 */
export let y = C.DOVE_START_Y();
export let velocity = 0;

const doveImage = new Image();
doveImage.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕊️</text></svg>';

let flapAge = 999; // frames since last flap — drives the squash-stretch
let bobPhase = 0;
const trail = []; // recent positions for the motion ribbon

/** Gives the Dove one upward impulse. */
export function flap() {
	velocity = C.LIFT;
	flapAge = 0;
}

/** Restores the Dove to the canonical beginning of a fresh run. */
export function reset() {
	y = C.DOVE_START_Y();
	velocity = 0;
	flapAge = 999;
	bobPhase = 0;
	trail.length = 0;
}

/** Keeps the current run inside a resized playfield without resetting progress. */
export function constrainToViewport() {
	y = Math.min(
		Math.max(y, C.DOVE_RADIUS),
		Math.max(C.DOVE_RADIUS, C.CANVAS_HEIGHT - C.DOVE_RADIUS)
	);
}

/** Advances gravity and clamps only the upper flight boundary. */
export function update() {
	velocity += C.GRAVITY;
	y += velocity;
	if (y < C.DOVE_RADIUS) {
		y = C.DOVE_RADIUS;
		velocity = 0;
	}
	flapAge++;
	bobPhase += 0.09;
	trail.push({ x: C.DOVE_START_X(), y });
	if (trail.length > 10) trail.shift();
}

/** Draws the Dove with flap squash-stretch, idle bob, glow, and trail. */
export function draw(context) {
	const dx = C.DOVE_START_X();
	// fading motion ribbon
	for (let i = 0; i < trail.length; i++) {
		const t = trail[i];
		const a = (i / trail.length) * 0.28;
		context.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
		context.beginPath();
		context.arc(t.x - (trail.length - i) * 3, t.y, C.DOVE_RADIUS * (0.35 + 0.5 * (i / trail.length)), 0, Math.PI * 2);
		context.fill();
	}
	const bob = Math.sin(bobPhase) * 3;
	// squash-stretch: stretch right after a flap, ease back over ~14 frames
	const k = Math.min(1, flapAge / 14);
	const stretchY = 1 + 0.28 * (1 - k);
	const stretchX = 1 - 0.18 * (1 - k);
	const rotation = Math.max(-Math.PI / 6, Math.min(Math.PI / 4, velocity * 0.05));
	context.save();
	context.translate(dx, y + bob);
	context.rotate(rotation);
	context.scale(stretchX, stretchY);
	// soft halo so the dove reads against bright sky
	const halo = context.createRadialGradient(0, 0, 4, 0, 0, C.DOVE_RADIUS * 1.9);
	halo.addColorStop(0, 'rgba(255,255,255,0.55)');
	halo.addColorStop(1, 'rgba(255,255,255,0)');
	context.fillStyle = halo;
	context.beginPath();
	context.arc(0, 0, C.DOVE_RADIUS * 1.9, 0, Math.PI * 2);
	context.fill();
	context.drawImage(doveImage, -C.DOVE_WIDTH / 2, -C.DOVE_HEIGHT / 2, C.DOVE_WIDTH, C.DOVE_HEIGHT);
	context.restore();
}
