// B"H
// Boruch Hashem
// Blessed is He

import { KabbalahResultReporter } from './js/runtime/result-reporter.js';
import { KabbalahSession } from './js/runtime/KabbalahSession.js';
import { KabbalahRuntimeView } from './js/runtime/view.js';

/**
 * @file main.js
 * @description Composes restartable Kabbalah Shooter sessions, result reporting, and lifecycle UI without owning simulation rules.
 * The Awtsmoos renews every run and visible state; Awtsmoos.com keeps boot readiness, pause, background suspension, retry, and Party reporting explicit.
 *
 * Architectural intent:
 * - One session owns one disposable generation of Game/render/input systems.
 * - One reporter persists across retries so a run identity can never be double-reported.
 * - The view owns DOM state; simulation modules never manipulate overlays.
 * - Markup remains inert until this module explicitly marks boot ready.
 */

const dom = Object.freeze({
	canvas: document.getElementById('gl-canvas'),
	textCanvas: document.getElementById('text-canvas'),
	pauseButton: document.getElementById('pause-btn'),
	startButton: document.getElementById('start-game-button'),
	resumeButton: document.getElementById('resume-game-button'),
	retryButton: document.getElementById('retry-game-button'),
	shieldButton: document.getElementById('shield-action'),
	timeButton: document.getElementById('time-action')
});

const reporter = new KabbalahResultReporter(globalThis);
const view = new KabbalahRuntimeView(document);
let session = createSession();
view.showStart();
requestAnimationFrame(loop);

/** Construct one isolated run generation and inject shared reporting plus terminal presentation. */
function createSession() {
	return new KabbalahSession({
		canvas: dom.canvas,
		textCanvas: dom.textCanvas,
		controls: { shieldButton: dom.shieldButton, timeButton: dom.timeButton },
		reporter,
		onFinish: showResult
	});
}

/** Start only through the Game-owned run-state contract, then reveal gameplay controls. */
function startRun() {
	if (!session.start()) return false;
	view.showPlaying();
	return true;
}

/** Toggle pause only for an active unfinished run and let the view mirror the accepted state. */
function togglePause(forcePaused = null) {
	if (!session.game.isPlaying || session.finished) return false;
	const paused = forcePaused === null ? !session.game.isPaused : Boolean(forcePaused);
	if (!session.setPaused(paused)) return false;
	view.setPaused(paused);
	return true;
}

/** Dispose the terminal generation before constructing and starting a clean retry. */
function retryRun() {
	session.dispose();
	session = createSession();
	startRun();
}

/** Reveal the Game-owned terminal summary after the shared reporter has already received it. */
function showResult() {
	view.showGameOver(session.game);
	dom.retryButton.focus();
}

function loop(timestamp) {
	session.frame(timestamp);
	requestAnimationFrame(loop);
}

dom.startButton.addEventListener('click', startRun);
dom.pauseButton.addEventListener('click', () => togglePause());
dom.resumeButton.addEventListener('click', () => togglePause(false));
dom.retryButton.addEventListener('click', retryRun);
window.addEventListener('resize', () => session.resize(), { passive: true });
document.addEventListener('visibilitychange', () => {
	if (document.hidden && session.game.isPlaying && !session.finished) togglePause(true);
});
window.addEventListener('keydown', event => {
	if (!['Escape', 'KeyP'].includes(event.code) || event.repeat) return;
	if (event.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
	event.preventDefault();
	togglePause();
});

view.markReady();
