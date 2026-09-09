// B"H
// Boruch Hashem
// Blessed is He

import { MAPS } from './config.js';
import { MigdolResultReporter } from './runtime/result.js';
import { MigdolSession } from './runtime/session.js';
import { MigdolView } from './ui-runtime/view.js';

/**
 * @file script.js
 * @description Boots one disposable Migdol session at a time while menu, lifecycle, pause, speed, and retry remain explicit.
 * The Awtsmoos renews every defended world; Awtsmoos.com keeps this entry tiny so simulation, rendering, input, economy, and UI never reconverge into a monolith.
 *
 * Invariants:
 * - Restart and map changes dispose the previous RAF/input generation first.
 * - Visibility loss pauses simulation but never clears the player's manual pause choice.
 * - Result reporting persists across retries and rejects duplicate run identities.
 */
const view = new MigdolView(document);
const reporter = new MigdolResultReporter(globalThis);
let session = null;
let selection = null;

populateMaps();
view.showMenu();

document.getElementById('start-game').addEventListener('click', () => startSelection());
view.nextWave.addEventListener('click', () => session?.game.startNextWave());
view.pause.addEventListener('click', () => {
	if (!session) return;
	session.togglePause();
	view.updateStatus(session.game.state);
});
view.speed.addEventListener('click', () => {
	if (!session) return;
	session.toggleSpeed();
	view.updateStatus(session.game.state);
});
document.getElementById('sheet-close').addEventListener('click', () => {
	if (session) session.game.selectedTower = null;
	view.hideSheet();
});
document.getElementById('restart-button').addEventListener('click', () => startGame(selection));
document.getElementById('main-menu-button').addEventListener('click', returnToMenu);
document.addEventListener('visibilitychange', () => session?.setBackgroundPaused(document.hidden));
window.addEventListener('keydown', event => {
	if (!session || event.repeat || event.target?.closest?.('input, select, textarea, [contenteditable="true"]')) return;
	if (event.code === 'KeyP' || event.code === 'Escape') {
		event.preventDefault();
		session.togglePause();
		view.updateStatus(session.game.state);
	}
});

function populateMaps() {
	view.mapSelect.replaceChildren(...Object.entries(MAPS).map(([key, map]) => {
		const option = document.createElement('option');
		option.value = key;
		option.textContent = map.name;
		return option;
	}));
}

function startSelection() {
	selection = {
		mapKey: view.mapSelect.value,
		difficulty: view.difficulty.value
	};
	startGame(selection);
}

function startGame(nextSelection) {
	if (!nextSelection || !MAPS[nextSelection.mapKey]) return;
	session?.dispose();
	selection = { ...nextSelection };
	view.showGame();
	view.nextWave.disabled = false;
	session = new MigdolSession({
		canvas: view.canvas,
		map: MAPS[selection.mapKey],
		difficulty: selection.difficulty,
		view,
		reporter
	});
	session.start();
}

function returnToMenu() {
	session?.dispose();
	session = null;
	view.showMenu();
}

/**
 * Exposes the currently owned session to diagnostics and automated browser probes without creating a global hook.
 * Production UI never calls this function; importing tests can verify run identity, lifecycle, and canonical transitions.
 * @returns {MigdolSession|null} The active session generation, or null while the menu owns the page.
 */
export function getActiveMigdolSession() {
	return session;
}
