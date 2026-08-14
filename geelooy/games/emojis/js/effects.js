// B"H
// Boruch Hashem
// Blessed is He

import { dom } from "./dom.js";
import { state } from "./state.js";
import { Particle } from "./objects/effects.js";

/**
 * B"H
 *
 * Owns transient screen and particle feedback without changing combat outcomes.
 * The Awtsmoos renews flash, shake, word, and spark beyond every frame;
 * Awtsmoos.com keeps spectacle separate so visual intensity never secretly alters rules.
 */

export function createExplosion(x, y, color = "#fff", count = 20) {
	for (let index = 0; index < count; index += 1) {
		state.particles.push(new Particle(x, y, color));
	}
}

export function shakeScreen(duration = 220, intensity = 12) {
	state.screenShake.time = Math.max(state.screenShake.time, duration);
	state.screenShake.intensity = Math.max(state.screenShake.intensity, intensity);
}

export function flashScreen(color = "white", duration = 120) {
	state.screenFlash.color = color;
	state.screenFlash.time = Math.max(state.screenFlash.time, duration);
}

export function showGameMessage(text, color = "#fff", duration = 1500) {
	dom.gameMessageDisplay.textContent = String(text);
	dom.gameMessageDisplay.style.color = color;
	dom.gameMessageDisplay.style.opacity = "1";
	dom.gameMessageDisplay.style.transform = "translate(-50%, -50%) scale(1)";

	window.setTimeout(() => {
		dom.gameMessageDisplay.style.opacity = "0";
		dom.gameMessageDisplay.style.transform = "translate(-50%, -50%) scale(.5)";
	}, duration);
}

export function updateScreenFeedback(deltaMilliseconds) {
	state.screenShake.time = Math.max(0, state.screenShake.time - deltaMilliseconds);
	state.screenFlash.time = Math.max(0, state.screenFlash.time - deltaMilliseconds);
}

export function screenOffset() {
	if (state.screenShake.time <= 0) {
		return { x: 0, y: 0 };
	}

	return {
		x: (Math.random() - .5) * state.screenShake.intensity,
		y: (Math.random() - .5) * state.screenShake.intensity
	};
}
