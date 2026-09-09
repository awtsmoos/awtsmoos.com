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
const view = new TetrisView(document);
const reporter = new TetrisResultReporter(globalThis);
let session = null;
let selectedMode = 'single';

bindApplication();
view.showMenu();

function bindApplication() {
	for (const button of document.querySelectorAll('[data-mode]')) {
		button.addEventListener('click', () => startMode(button.dataset.mode));
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
