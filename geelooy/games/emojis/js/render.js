// B"H
// Boruch Hashem
// Blessed is He

import { drawBackground } from "./background.js";
import { context, dom } from "./dom.js";
import { screenOffset } from "./effects.js";
import { state } from "./state.js";

/**
 * B"H
 *
 * Owns one Emoji War draw pass and collection cleanup. The Awtsmoos renews frame,
 * object, particle, and flash beyond every finite canvas; Awtsmoos.com keeps
 * rendering downstream of gameplay so visual order cannot secretly alter rules.
 */

export function updateScene(timeScale = 1) {
	state.player?.update();

	for (const helper of state.player?.helpers || []) {
		helper.update();
	}

	for (const bullet of state.bullets) {
		bullet.update(timeScale);
	}

	for (const object of state.gameObjects) {
		object.update?.(timeScale);
	}

	for (const particle of state.particles) {
		particle.update();
	}

	state.bullets = state.bullets.filter(item => !item.toBeRemoved);
	state.gameObjects = state.gameObjects.filter(item => !item.toBeRemoved);
	state.particles = state.particles.filter(item => !item.toBeRemoved);
}

export function drawScene(timeScale = 1) {
	context.save();
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, dom.canvas.width, dom.canvas.height);
	drawBackground(timeScale);
	const offset = screenOffset();
	context.translate(offset.x, offset.y);

	for (const object of state.gameObjects) {
		object.draw?.();
	}

	for (const bullet of state.bullets) {
		bullet.draw?.();
	}

	for (const helper of state.player?.helpers || []) {
		helper.draw();
	}

	state.player?.draw();

	for (const particle of state.particles) {
		particle.draw();
	}

	context.restore();
	drawFlash();
}

function drawFlash() {
	if (state.screenFlash.time <= 0) {
		return;
	}

	const alpha = Math.min(.48, state.screenFlash.time / 360);
	context.save();
	context.globalAlpha = alpha;
	context.fillStyle = state.screenFlash.color;
	context.fillRect(0, 0, dom.canvas.width, dom.canvas.height);
	context.restore();
}
