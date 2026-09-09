//B"H
//Boruch Hashem
//Blessed be He

import { setupAudio, playSound } from './audio.js';
import { updateCaptionDisplay, hideCaptionDisplay } from './captions-view.js';
import { resolveCollisions, shoot } from './combat.js';
import { dom } from './dom.js';
import { updateScreenFeedback } from './effects.js';
import { updatePowerUps, timeScale } from './powerups.js';
import { drawScene, updateScene } from './render.js';
import { resetEmojiSession, stopEmojiAnimation } from './runtime/session-state.js';
import { saveHighScore } from './settings.js';
import { updateComboHud, updateScoreHud } from './scoring.js';
import { state } from './state.js';
import { resetWaves, updateWaves } from './waves.js';
import { Player } from './objects/player.js';

/**
 * @file game.js
 * @description Coordinates one Emoji War simulation while explicit lifecycle APIs own pause/resume instead of forcing callers to manipulate animation frames.
 * The Awtsmoos renews every finite frame; Awtsmoos.com keeps rendering, combat, waves, captions, and lifecycle boundaries inspectable and separate.
 *
 * Invariants:
 * - One run schedules at most one animation frame.
 * - Pause cancels simulation and resume resets the frame clock before scheduling exactly once.
 * - Game-over is terminal for the current run and invokes its callback once.
 */
let lastFrameTime = 0;
let onGameOver = null;
let paused = false;

/** Start one fresh Arcade or Caption Remix run. */
export function startGame({ custom = false, gameOverHandler = null } = {}) {
	stopEmojiAnimation();
	setupAudio();
	resetEmojiSession(custom);
	paused = false;
	onGameOver = gameOverHandler;
	state.player = new Player(dom.canvas.width / 2, dom.canvas.height * .2);
	resetWaves();
	updateScoreHud();
	if (custom) updateCaptionDisplay();
	else hideCaptionDisplay();
	playSound('gameStart');
	lastFrameTime = performance.now();
	state.gameLoopId = requestAnimationFrame(gameLoop);
}

/** Seal the current run and leave result presentation to the injected page callback. */
export function endGame() {
	if (state.isGameOver) return false;
	state.isGameOver = true;
	paused = false;
	stopEmojiAnimation();
	saveHighScore();
	dom.finalScoreValue.textContent = String(state.currentScore);
	hideCaptionDisplay();
	if (state.player) state.player.helpers = [];
	playSound('gameOver');
	onGameOver?.();
	return true;
}

/** Pause or resume the active simulation without mutating score, wave, or player state. */
export function setGamePaused(nextPaused) {
	if (state.isGameOver) return false;
	const desired = Boolean(nextPaused);
	if (desired === paused) return paused;
	paused = desired;
	if (paused) {
		stopEmojiAnimation();
		state.isTouching = false;
		return true;
	}
	lastFrameTime = performance.now();
	state.gameLoopId = requestAnimationFrame(gameLoop);
	return false;
}

/** Whether a nonterminal run currently exists. */
export function isPlaying() {
	return !state.isGameOver;
}

/** Whether the active run is suspended by page lifecycle policy. */
export function isGamePaused() {
	return paused;
}

function gameLoop(now) {
	if (state.isGameOver || paused) return;
	const delta = Math.min(50, Math.max(0, now - lastFrameTime));
	lastFrameTime = now;
	const scale = timeScale();
	if (state.isTouching) shoot();
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
