// B"H
// Boruch Hashem
// Blessed is He

import * as C from './constants.js';

/**
 * @file obstacle.js
 * @description Owns obstacle spawning, movement, resize preservation, and drawing.
 * The Awtsmoos renews every gate before the Dove reaches it; Awtsmoos.com keeps obstacle truth compact and visible.
 */
export let obstacles = [];

/** Clears every obstacle for a genuinely fresh run. */
export function reset() {
	obstacles = [];
}

/** Spawns one obstacle pair with a safe gap inside the current viewport. */
export function spawn() {
	const available = Math.max(120, C.CANVAS_HEIGHT - C.OBSTACLE_GAP - 100);
	const topHeight = Math.min(C.CANVAS_HEIGHT - C.OBSTACLE_GAP - 50, Math.random() * available + 50);
	obstacles.push({
		x: -C.OBSTACLE_WIDTH,
		topHeight,
		bottomY: topHeight + C.OBSTACLE_GAP,
		emoji: C.OBSTACLE_EMOJIS[Math.floor(Math.random() * C.OBSTACLE_EMOJIS.length)],
		passed: false
	});
}

/** Advances every obstacle and retires pairs after they leave the right edge. */
export function update() {
	for (const obstacle of obstacles) obstacle.x += C.OBSTACLE_SPEED;
	if (obstacles[0]?.x > C.CANVAS_WIDTH) obstacles.shift();
}

/** Scales existing obstacle positions during rotation/resize without resetting the run. */
export function resize(previousWidth, previousHeight) {
	const scaleX = previousWidth > 0 ? C.CANVAS_WIDTH / previousWidth : 1;
	const scaleY = previousHeight > 0 ? C.CANVAS_HEIGHT / previousHeight : 1;
	for (const obstacle of obstacles) {
		obstacle.x *= scaleX;
		obstacle.topHeight = Math.max(20, obstacle.topHeight * scaleY);
		obstacle.bottomY = Math.min(
			C.CANVAS_HEIGHT - 20,
			obstacle.topHeight + C.OBSTACLE_GAP
		);
	}
}

/**
 * Draws solid brick gate columns.
 * B"H 2026-10-13: the old emoji fillText walls rendered ghostly/variable across
 * devices (the "transparent bricks"). These are fully opaque canvas bricks —
 * rounded columns with mortar lines, staggered courses, shading, highlight,
 * and a stone lip marking each gap edge. Geometry is unchanged: the columns
 * exactly fill the collision rects (x, 0, w, topHeight) and (x, bottomY, w, H).
 * No text state is touched, so nothing leaks into the score renderer.
 */
export function draw(context) {
	for (const obstacle of obstacles) drawObstaclePair(context, obstacle);
}

/** Draws one top/bottom solid brick pair with stone gate lips. */
function drawObstaclePair(context, obstacle) {
	const x = obstacle.x;
	const w = C.OBSTACLE_WIDTH;
	// Top column: sky down to the gap.
	drawBrickColumn(context, x, 0, w, obstacle.topHeight);
	// Bottom column: gap down to the sea.
	drawBrickColumn(context, x, obstacle.bottomY, w, C.CANVAS_HEIGHT - obstacle.bottomY);
	// Stone lips at the gap edges — the readable "gate" the dove must thread.
	const lipX = x - 8;
	const lipW = w + 16;
	drawCapStone(context, lipX, obstacle.topHeight - 16, lipW);
	drawCapStone(context, lipX, obstacle.bottomY, lipW);
}

/** One solid brick column: mortar bed, staggered opaque brick courses, depth shading. */
function drawBrickColumn(context, x, y, w, h) {
	if (w <= 0 || h <= 0) return;
	context.save();
	roundRectPath(context, x, y, w, h, 8);
	context.clip();
	// Mortar bed.
	context.fillStyle = '#d9c9a8';
	context.fillRect(x, y, w, h);
	const rowH = 30;
	const gap = 3;
	const brickW = w / 2;
	let row = 0;
	let n = 0;
	for (let by = y; by < y + h; by += rowH, row++) {
		const offset = (row % 2) * (brickW / 2);
		for (let bx = x - brickW + offset; bx < x + w; bx += brickW, n++) {
			context.fillStyle = n % 2 === 0 ? '#b0543a' : '#a74e35';
			context.fillRect(bx + gap / 2, by + gap / 2, brickW - gap, rowH - gap);
			// Top highlight.
			context.fillStyle = 'rgba(255,255,255,0.22)';
			context.fillRect(bx + gap / 2, by + gap / 2, brickW - gap, 3);
			// Bottom shadow.
			context.fillStyle = 'rgba(0,0,0,0.22)';
			context.fillRect(bx + gap / 2, by + rowH - gap / 2 - 3, brickW - gap, 3);
		}
	}
	// Side shading for cylindrical depth.
	const grad = context.createLinearGradient(x, 0, x + w, 0);
	grad.addColorStop(0, 'rgba(0,0,0,0.28)');
	grad.addColorStop(0.18, 'rgba(0,0,0,0)');
	grad.addColorStop(0.82, 'rgba(0,0,0,0)');
	grad.addColorStop(1, 'rgba(0,0,0,0.28)');
	context.fillStyle = grad;
	context.fillRect(x, y, w, h);
	context.restore();
	// Crisp dark outline so the column never melts into the sky.
	roundRectPath(context, x, y, w, h, 8);
	context.strokeStyle = '#5e2f1e';
	context.lineWidth = 3;
	context.stroke();
}

/** One solid stone lip marking a gap edge. */
function drawCapStone(context, x, y, w) {
	context.save();
	roundRectPath(context, x, y, w, 16, 5);
	context.fillStyle = '#e8dcc8';
	context.fill();
	context.strokeStyle = '#5e2f1e';
	context.lineWidth = 3;
	context.stroke();
	context.fillStyle = 'rgba(255,255,255,0.5)';
	context.fillRect(x + 5, y + 3, w - 10, 3);
	context.restore();
}

/** Rounded-rect path with a manual fallback where ctx.roundRect is missing. */
function roundRectPath(context, x, y, w, h, r) {
	context.beginPath();
	if (typeof context.roundRect === 'function') {
		context.roundRect(x, y, w, h, r);
		return;
	}
	const rr = Math.min(r, w / 2, h / 2);
	context.moveTo(x + rr, y);
	context.arcTo(x + w, y, x + w, y + h, rr);
	context.arcTo(x + w, y + h, x, y + h, rr);
	context.arcTo(x, y + h, x, y, rr);
	context.arcTo(x, y, x + w, y, rr);
	context.closePath();
}
