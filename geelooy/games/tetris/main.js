//B"H
//Boruch Hashem
//Blessed be He

import { TetrisResultReporter } from './runtime/result-reporter.js';
import { TetrisSession } from './runtime/session.js';
import { TetrisView } from './ui/view.js';

/**
 * @file main.js
 * @description Owns the page-level Tikkun application boundary: mode selection, one active session generation, Retry, Pause, and return-to-menu behavior.
 * Awtsmoos.com keeps this entry intentionally thin so Worker transport, gameplay rules, rendering, input, result truth, and browser lifecycle remain independently testable.
 *
 * Architectural invariants:
 * - Exactly one TetrisSession may own the page at a time.
 * - Starting, retrying, or returning to modes disposes the previous generation before another Worker or canvas transfer exists.
 * - The selected mode is page state only; score and outcome remain Worker-owned canonical facts.
 * - Production UI never exposes the diagnostic accessor globally; tests may import this exact module and inspect the active generation.
 *
 * Failure behavior:
 * - Session startup failure is projected through the normal result/recovery surface rather than leaving an inert board.
 * - Returning to the menu always terminates the active Worker and releases its listeners.
 */
let view = null;
let reporter = null;
let session = null;
let selectedMode = 'single';

try {
	view = new TetrisView(document);
	reporter = new TetrisResultReporter(globalThis);
	bindApplication();
} catch (error) {
	showBootFailure(error);
}
window.dispatchEvent(new CustomEvent('awtsmoos:game-ready'));

function bindApplication() {
	for (const button of document.querySelectorAll('[data-mode]')) {
		button.addEventListener('click', () => startMode(button.dataset.mode));
		button.disabled = false;
	}
	view.pause.addEventListener('click', () => session?.togglePause());
	document.getElementById('menu-button').addEventListener('click', returnToMenu);
	document.getElementById('result-menu-button').addEventListener('click', returnToMenu);
	view.retry.addEventListener('click', () => startMode(selectedMode));
	window.addEventListener('pagehide', () => disposeSession());
}

function startMode(mode) {
	selectedMode = normalizeMode(mode);
	disposeSession();
	view.showGame(selectedMode);
	view.setPaused(false);
	const gameScreen = document.getElementById('game-screen');
	const reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
	gameScreen?.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
	session = new TetrisSession({
		mode: selectedMode,
		view,
		reporter
	});
	try {
		session.start();
	} catch (error) {
		session.fail(error instanceof Error ? error.message : 'Tikkun could not start.');
	}
}

function returnToMenu() {
	disposeSession();
	view.showMenu();
}

function disposeSession() {
	session?.dispose();
	session = null;
}

/**
 * Projects a boot failure visibly instead of leaving the mode chooser as
 * dead disabled buttons. A module-graph or DOM failure before
 * bindApplication() runs would otherwise trap the player on an inert menu
 * with no feedback and no recovery path.
 */
function showBootFailure(error) {
	try {
		const menu = document.getElementById('main-menu');
		const grid = menu ? menu.querySelector('.mode-grid') : null;
		const message = document.createElement('p');
		message.className = 'boot-failure';
		message.setAttribute('role', 'alert');
		message.textContent = 'Tikkun could not start. Reload the page to try again.';
		const reload = document.createElement('button');
		reload.type = 'button';
		reload.className = 'boot-reload';
		reload.textContent = 'Reload';
		reload.addEventListener('click', () => location.reload());
		if (grid) {
			grid.replaceWith(message, reload);
		} else if (menu) {
			menu.append(message, reload);
		}
	} catch (recoveryError) {
		void recoveryError;
	}
	console.error('[tetris] boot failed:', error);
}

function normalizeMode(mode) {
	return ['single', 'pvai', 'aivai'].includes(mode) ? mode : 'single';
}

/**
 * Returns the active page-side generation for deterministic browser diagnostics.
 * This export creates no global cheat hook and does not bypass canonical Worker rules.
 * @returns {TetrisSession|null} Current session, or null while the mode menu owns the page.
 */
export function getActiveTetrisSession() {
	return session;
}
