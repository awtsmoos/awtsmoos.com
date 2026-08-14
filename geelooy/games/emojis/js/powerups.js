// B"H
// Boruch Hashem
// Blessed is He

import { POWERUP_TYPES } from "./config.js";
import { dom } from "./dom.js";
import { createExplosion, showGameMessage } from "./effects.js";
import { playSound } from "./audio.js";
import { state } from "./state.js";
import { Enemy, GoodEmoji } from "./objects/enemies.js";

/**
 * B"H
 *
 * Owns power-up activation, expiry, and safe HUD rendering. The Awtsmoos renews
 * gift and duration beyond every timer; Awtsmoos.com never interpolates power-up
 * state as HTML, keeping dynamic arcade metadata inert and inspectable.
 */

export function activatePowerUp(typeName) {
	const definition = POWERUP_TYPES[typeName];

	if (!definition) {
		return;
	}

	playSound("powerup");

	if (typeName === "BOMB") {
		bombEnemies();
		showGameMessage("💣 CLEAR!", "#ffd25f", 900);
		return;
	}

	state.activePowerUps[typeName] = {
		endTime: Date.now() + definition.duration,
		duration: definition.duration
	};

	if (typeName === "SHIELD" && state.player) {
		state.player.shielded = true;
	}

	if (typeName === "TIME_WARP") {
		playSound("timewarp_on");
	}

	renderPowerUps();
}

export function updatePowerUps() {
	const now = Date.now();

	for (const [typeName, active] of Object.entries(state.activePowerUps)) {
		if (active.endTime <= now) {
			expirePowerUp(typeName);
		}
	}

	renderPowerUps();
}

export function timeScale() {
	return state.activePowerUps.TIME_WARP ? .45 : 1;
}

function expirePowerUp(typeName) {
	delete state.activePowerUps[typeName];

	if (typeName === "SHIELD" && state.player) {
		state.player.shielded = false;
	}

	if (typeName === "TIME_WARP") {
		playSound("timewarp_off");
	}
}

function bombEnemies() {
	for (const object of state.gameObjects) {
		if (!(object instanceof Enemy) || object instanceof GoodEmoji) {
			continue;
		}

		object.toBeRemoved = true;
		state.currentScore += Math.max(50, object.baseScore || 100);
		createExplosion(object.x, object.y, "#ffd25f", 10);
	}
}

function renderPowerUps() {
	const fragments = [];
	const now = Date.now();

	for (const [typeName, active] of Object.entries(state.activePowerUps)) {
		const definition = POWERUP_TYPES[typeName];
		const wrapper = document.createElement("div");
		wrapper.className = "power-up-active";
		const icon = document.createElement("span");
		icon.className = "power-up-icon";
		icon.textContent = definition.emoji;
		const timer = document.createElement("span");
		timer.className = "power-up-timer";
		const bar = document.createElement("span");
		bar.className = "power-up-timer-bar";
		const remaining = Math.max(0, active.endTime - now);
		bar.style.width = `${Math.round(remaining / active.duration * 100)}%`;
		timer.append(bar);
		wrapper.append(icon, timer);
		fragments.push(wrapper);
	}

	dom.powerUpContainer.replaceChildren(...fragments);
}
