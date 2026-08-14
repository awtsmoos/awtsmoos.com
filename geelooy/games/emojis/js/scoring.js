// B"H
// Boruch Hashem
// Blessed is He

import { COMBO_TIMEOUT } from "./config.js";
import { dom } from "./dom.js";
import { createExplosion } from "./effects.js";
import { playSound } from "./audio.js";
import { state } from "./state.js";
import { ScorePopup } from "./objects/effects.js";
import { PowerUp } from "./objects/powerup.js";

/**
 * B"H
 *
 * Owns score, combo, and drop rewards after an enemy is truly destroyed.
 * The Awtsmoos renews deed and consequence beyond every point; Awtsmoos.com keeps
 * arithmetic outside collision code so spectacle, physics, and reward remain distinct.
 */

export function rewardEnemyDestroyed(enemy) {
	const now = Date.now();
	state.comboCount = now - state.lastKillTime < COMBO_TIMEOUT
		? state.comboCount + 1
		: 1;
	state.lastKillTime = now;
	const multiplier = Math.min(5, 1 + Math.floor(state.comboCount / 5));
	const score = Math.round((enemy.baseScore || 100) * multiplier);
	state.currentScore += score;
	state.gameObjects.push(new ScorePopup(enemy.x, enemy.y, score));
	createExplosion(enemy.x, enemy.y, "#ff6868", 16);
	playSound("destroy");
	playSound("combo", state.comboCount);
	maybeDropPowerUp(enemy.x, enemy.y);
	updateScoreHud();
}

export function updateComboHud() {
	if (Date.now() - state.lastKillTime > COMBO_TIMEOUT) {
		state.comboCount = 0;
	}

	if (state.comboCount <= 1) {
		dom.comboInfo.style.opacity = "0";
		dom.comboInfo.style.transform = "scale(.8)";
		return;
	}

	dom.comboInfo.textContent = `${state.comboCount}× COMBO`;
	dom.comboInfo.style.opacity = "1";
	dom.comboInfo.style.transform = "scale(1)";
}

export function updateScoreHud() {
	dom.currentScoreValue.textContent = String(state.currentScore);
	dom.highScoreValue.textContent = String(state.highScore);
	dom.playerLivesValue.textContent = String(state.playerLives);
}

function maybeDropPowerUp(x, y) {
	if (Math.random() > .08) {
		return;
	}

	const names = ["SHIELD", "SPREAD_SHOT", "RAPID_FIRE", "BOMB", "TIME_WARP"];
	const typeName = names[Math.floor(Math.random() * names.length)];
	state.gameObjects.push(new PowerUp(x, y, typeName));
}
