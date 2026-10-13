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
	drawDoveBody(context, flapAge, bobPhase);
	context.restore();
}

/**
 * Draws the dove as pure vector art facing right: white body, head, amber beak,
 * folded tail fan, and one flapping wing driven by flapAge (fresh flap = wing up).
 * Geometry stays inside DOVE_WIDTH/DOVE_HEIGHT so collision (DOVE_RADIUS) is unchanged.
 */
function drawDoveBody(context, flapAge, bobPhase) {
	const R = C.DOVE_RADIUS; // 20
	const k = Math.min(1, flapAge / 14); // 0 = just flapped, 1 = gliding
	// body: plump white ellipse facing right
	const bodyGrad = context.createLinearGradient(0, -R * 0.6, 0, R * 0.6);
	bodyGrad.addColorStop(0, '#ffffff');
	bodyGrad.addColorStop(0.7, '#eef3f8');
	bodyGrad.addColorStop(1, '#d7e2ec');
	context.fillStyle = bodyGrad;
	context.beginPath();
	context.ellipse(0, 0, R, R * 0.62, 0, 0, Math.PI * 2);
	context.fill();
	// tail fan: three feathers fanning left
	context.fillStyle = '#e3ebf3';
	for (let i = -1; i <= 1; i++) {
		context.save();
		context.translate(-R * 0.85, 0);
		context.rotate(i * 0.38 + 0.1);
		context.beginPath();
		context.moveTo(0, -4);
		context.lineTo(-R * 0.75, -7);
		context.lineTo(-R * 0.75, 7);
		context.lineTo(0, 4);
		context.closePath();
		context.fill();
		context.restore();
	}
	// wing: arcs upward on a fresh flap, settles folded while gliding
	const wingLift = (1 - k) * 1.15 + Math.sin(bobPhase * 2) * 0.1;
	context.save();
	context.translate(-R * 0.15, -R * 0.28);
	context.rotate(-wingLift);
	const wingGrad = context.createLinearGradient(0, 0, 0, -R * 1.1);
	wingGrad.addColorStop(0, '#f7fafc');
	wingGrad.addColorStop(1, '#cdd9e4');
	context.fillStyle = wingGrad;
	context.beginPath();
	context.ellipse(0, -R * 0.42, R * 0.52, R * 0.66, 0.35, 0, Math.PI * 2);
	context.fill();
	context.strokeStyle = 'rgba(150,170,190,0.6)';
	context.lineWidth = 1.5;
	context.stroke();
	context.restore();
	// head
	context.fillStyle = '#ffffff';
	context.beginPath();
	context.arc(R * 0.72, -R * 0.34, R * 0.44, 0, Math.PI * 2);
	context.fill();
	// beak: small amber triangle
	context.fillStyle = '#f0a832';
	context.beginPath();
	context.moveTo(R * 1.08, -R * 0.44);
	context.lineTo(R * 1.38, -R * 0.3);
	context.lineTo(R * 1.08, -R * 0.18);
	context.closePath();
	context.fill();
	// eye
	context.fillStyle = '#1c2733';
	context.beginPath();
	context.arc(R * 0.82, -R * 0.42, R * 0.09, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = 'rgba(255,255,255,0.9)';
	context.beginPath();
	context.arc(R * 0.85, -R * 0.45, R * 0.035, 0, Math.PI * 2);
	context.fill();
}
