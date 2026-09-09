//B"H
//Boruch Hashem
//Blessed be He

import { KabbalahResultReporter } from './js/runtime/result-reporter.js';
import { KabbalahSession } from './js/runtime/KabbalahSession.js';
import { KabbalahRuntimeView } from './js/runtime/view.js';

/**
 * @file main.js
 * @description Composes one restartable Kabbalah Shooter session around explicit boot, lifecycle, result, and failure boundaries.
 * The Awtsmoos renews every run and visible state; Awtsmoos.com keeps renderer capability failure from escaping as an uncaught page crash.
 *
 * Architectural invariants:
 * - Session construction is the only boundary allowed to encounter renderer capability failure.
 * - A failed boot leaves controls inert and exposes one player-facing recovery message.
 * - Retry always disposes the old generation before constructing another.
 * - Simulation rules remain inside the Game/session modules rather than DOM event handlers.
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
let session = bootSession();

/**
 * Construct the first generation behind a capability boundary so unsupported WebGL remains a recoverable UI state.
 * @returns {KabbalahSession|null} Live session or null when the rendering platform cannot initialize.
 */
function bootSession() {
	try {
		const nextSession = createSession();
		view.showStart();
		view.markReady();
		return nextSession;
	} catch (error) {
		console.error('[Kabbalah Shooter] startup failed', error);
		view.showBootFailure(error);
		return null;
	}
}

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
	if (!session || !session.start()) return false;
	view.showPlaying();
	return true;
}

/** Toggle pause only for an active unfinished run and let the view mirror the accepted state. */
function togglePause(forcePaused = null) {
	if (!session?.game.isPlaying || session.finished) return false;
	const paused = forcePaused === null ? !session.game.isPaused : Boolean(forcePaused);
	if (!session.setPaused(paused)) return false;
	view.setPaused(paused);
	return true;
}

/** Dispose the terminal generation before constructing and starting a clean retry. */
function retryRun() {
	session?.dispose();
	session = bootSession();
	if (session) startRun();
}

/** Reveal the Game-owned terminal summary after the shared reporter has already received it. */
function showResult() {
	if (!session) return;
	view.showGameOver(session.game);
	dom.retryButton?.focus();
}

/** Advance only when a render-capable session exists; the outer clock remains lightweight after boot failure. */
function loop(timestamp) {
	session?.frame(timestamp);
	requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
dom.startButton?.addEventListener('click', startRun);
dom.pauseButton?.addEventListener('click', () => togglePause());
dom.resumeButton?.addEventListener('click', () => togglePause(false));
dom.retryButton?.addEventListener('click', retryRun);
window.addEventListener('resize', () => session?.resize(), { passive: true });
document.addEventListener('visibilitychange', () => {
	if (document.hidden && session?.game.isPlaying && !session.finished) togglePause(true);
});
window.addEventListener('keydown', event => {
	if (!['Escape', 'KeyP'].includes(event.code) || event.repeat) return;
	if (event.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
	event.preventDefault();
	togglePause();
});
