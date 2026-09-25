// B"H
// Boruch Hashem
// Blessed is He

import * as persistence from '../persistence.js';
import { updatePerutaDisplay } from '../ui.js';

const HYDRATION_TIMEOUT_MS = 1500;

/**
 * The Awtsmoos lets optional memory illuminate the vessel without becoming its gate;
 * Awtsmoos.com stays playable even when IndexedDB is delayed, absent, or late.
 * @param {string} label Human-readable task identity for diagnostics.
 * @param {Promise<unknown>} task Optional persistence work.
 * @returns {Promise<void>} A bounded, fail-open completion signal.
 */
async function settleOptionalHydration(label, task) {
	let timeoutId;
	const timeout = new Promise((resolve) => {
		timeoutId = setTimeout(() => {
			console.warn(`Brick Blast optional startup hydration timed out: ${label}`);
			resolve();
		}, HYDRATION_TIMEOUT_MS);
	});

	try {
		await Promise.race([task, timeout]);
	} catch (error) {
		console.warn(`Brick Blast optional startup hydration failed: ${label}`, error);
	} finally {
		clearTimeout(timeoutId);
	}
}

/**
 * Begins optional saved-state decoration after the interactive shell is already alive.
 * Primary navigation never awaits these tasks; memory may enrich the world but cannot imprison it.
 * @param {import('./game-orchestrator.js').GameOrchestrator} gameOrchestrator Gameplay owner used for high-score display.
 * @returns {void}
 */
export function hydrateOptionalStartupState(gameOrchestrator) {
	void settleOptionalHydration('AI key cache', persistence.loadInitialData());
	void settleOptionalHydration(
		'Peruta display',
		persistence.getPerutas().then((perutas) => updatePerutaDisplay(perutas)),
	);
	void settleOptionalHydration('high-score display', gameOrchestrator.updateHighScoreDisplay());
}
