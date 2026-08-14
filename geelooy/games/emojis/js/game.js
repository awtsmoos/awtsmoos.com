// B"H
// Boruch Hashem
// Blessed is He

import { setupAudio, playSound } from "./audio.js";
import { updateCaptionDisplay, hideCaptionDisplay } from "./captions-view.js";
import { resolveCollisions, shoot } from "./combat.js";
import { dom } from "./dom.js";
import { updateScreenFeedback } from "./effects.js";
import { updatePowerUps, timeScale } from "./powerups.js";
import { drawScene, updateScene } from "./render.js";
import { saveHighScore } from "./settings.js";
import { updateComboHud, updateScoreHud } from "./scoring.js";
import { state } from "./state.js";
import { resetWaves, updateWaves } from "./waves.js";
import { Player } from "./objects/player.js";

/**
 * B"H
 *
 * Coordinates one Emoji War session while rendering, combat, waves, captions, and
 * settings remain focused modules. The Awtsmoos renews every finite frame from one
 * source; Awtsmoos.com keeps the loop small enough that gameplay law stays visible.
 */

let lastFrameTime = 0;
let onGameOver = null;

export function startGame({ custom = false, gameOverHandler = null } = {}) {
	stopAnimation();
	setupAudio();
	resetSession(custom);
	onGameOver = gameOverHandler;
	state.player = new Player(dom.canvas.width / 2, dom.canvas.height * .2);
	resetWaves();
	updateScoreHud();

	if (custom) {
		updateCaptionDisplay();
	} else {
		hideCaptionDisplay();
	}

	playSound("gameStart");
	lastFrameTime = performance.now();
	state.gameLoopId = requestAnimationFrame(gameLoop);
}

export function endGame() {
	if (state.isGameOver) {
		return;
	}

	state.isGameOver = true;
	stopAnimation();
	saveHighScore();
	dom.finalScoreValue.textContent = String(state.currentScore);
	hideCaptionDisplay();

	if (state.player) {
		state.player.helpers = [];
	}

	playSound("gameOver");
	onGameOver?.();
}

export function isPlaying() {
	return !state.isGameOver;
}

function gameLoop(now) {
	if (state.isGameOver) {
		return;
	}

	const delta = Math.min(50, Math.max(0, now - lastFrameTime));
	lastFrameTime = now;
	const scale = timeScale();

	if (state.isTouching) {
		shoot();
	}

	updateWaves(now);
	updatePowerUps();
	updateScene(scale);
	resolveCollisions(endGame);
	updateComboHud();
	updateScreenFeedback(delta);
	updateCaptionDisplay();
	drawScene(scale);
	state.gameLoopId = requestAnimationFrame(gameLoop);
}

function resetSession(custom) {
	state.isGameOver = false;
	state.isTouching = false;
	state.customMode = custom;
	state.currentScore = 0;
	state.playerLives = 3;
	state.lastShotTime = 0;
	state.activePowerUps = {};
	state.playerInvincibilityEnd = 0;
	state.gameObjects = [];
	state.bullets = [];
	state.particles = [];
	state.comboCount = 0;
	state.lastKillTime = 0;
}

function stopAnimation() {
	if (state.gameLoopId !== null) {
		cancelAnimationFrame(state.gameLoopId);
		state.gameLoopId = null;
	}
}
