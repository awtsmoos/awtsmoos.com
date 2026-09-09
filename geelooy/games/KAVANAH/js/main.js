//B"H
//Boruch Hashem
//Blessed be He

import * as Controls from './controls.js';
import * as Drawing from './drawing.js';
import * as GameActions from './game-actions.js';
import * as State from './state.js';
import { resetKavanahGameplayStep, stepKavanahGameplay } from './gameplay-step.js';
import { KavanahMenuController } from './menu-controller.js';
import { KavanahRunSession } from './runtime/run-session.js';
import { KavanahRuntimeView } from './runtime/view.js';
import { worldPhaseForAscension } from './runtime/world-phase.js';
import { KeliViewport } from './viewport.js';

/**
 * @file main.js
 * @description Composes KAVANAH canvas simulation with explicit run lifecycle, Four Worlds presentation, durable results, and viewport preservation.
 * The Awtsmoos renews every frame without confusing motion with authority; Awtsmoos.com keeps simulation, lifecycle, menu, and DOM presentation in separate vessels.
 *
 * Invariants:
 * - Exactly one animation loop exists for the page lifetime.
 * - Only an active unpaused run advances simulation.
 * - Death reports once and remains visible until explicit Retry or Menu.
 * - Background suspension cannot cancel a separate user pause reason.
 */
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const view = new KavanahRuntimeView(document);
const session = new KavanahRunSession(globalThis);
const menu = new KavanahMenuController(document.getElementById('teachings-screen'), document.getElementById('back-button'));
const viewport = new KeliViewport(canvas, State.init, State.resizeViewport);

viewport.start();

/** Start from the canvas menu only when its hit-tested Start action was actually accepted. */
function handleCanvasIntent(x, y) {
	if (!menu.handlePointerStart(x, y)) return;
	resetKavanahGameplayStep();
	session.begin();
	view.showPlaying();
}

/** Advance one live frame, update Four Worlds UI, and keep drawing alive while paused or terminal. */
function gameLoop() {
	if (State.getGameState() === 'playing' && session.active && !session.paused) {
		stepKavanahGameplay(canvas, finishGame);
	}
	const ascension = State.getAscension();
	view.showPhase(worldPhaseForAscension(ascension), ascension);
	Drawing.draw(context, canvas.width, canvas.height);
	requestAnimationFrame(gameLoop);
}

/** Seal one collision defeat through GameActions, shared run reporting, and durable result UI. */
function finishGame() {
	resetKavanahGameplayStep();
	const summary = GameActions.finishGame();
	if (!summary) return;
	const phase = worldPhaseForAscension(summary.ascension);
	const result = session.finish(summary.ascension, phase, 'defeat');
	if (result) view.showResult(result, phase);
}

/** Replace terminal state with one deliberately fresh run. */
function retryRun() {
	State.init(canvas.width, canvas.height);
	State.setGameState('playing');
	resetKavanahGameplayStep();
	session.begin();
	view.showPlaying();
}

/** Return to a fresh waiting canvas without beginning another run implicitly. */
function returnToMenu() {
	State.init(canvas.width, canvas.height);
	resetKavanahGameplayStep();
	view.showMenu();
}

/** Set one lifecycle pause reason while preserving every other independent reason. */
function setPause(reason, active) {
	if (!session.active || State.getGameState() !== 'playing') return false;
	const paused = session.setPaused(reason, active);
	view.setPaused(paused);
	return paused;
}

Controls.setupControls(canvas, handleCanvasIntent, GameActions.activateTikkun);
view.pauseButton?.addEventListener('click', () => setPause('user', !session.pauseReasons.has('user')));
view.retryButton?.addEventListener('click', retryRun);
view.menuButton?.addEventListener('click', returnToMenu);
document.addEventListener('visibilitychange', () => setPause('background', document.hidden));
window.addEventListener('keydown', event => {
	if (!['Escape', 'KeyP'].includes(event.code) || event.repeat || !session.active) return;
	if (event.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
	event.preventDefault();
	setPause('user', !session.pauseReasons.has('user'));
});

view.showMenu();
gameLoop();
