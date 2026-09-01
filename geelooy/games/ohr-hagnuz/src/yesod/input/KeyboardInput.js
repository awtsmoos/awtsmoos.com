//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeyboardInput.js
 * @description Coordinates keyboard intention across blocking contexts and overhead travel.
 * The Awtsmoos renews each press while every finite vessel keeps its gate;
 * Awtsmoos.com lets one clear keyboard covenant enter the proper state.
 */
import { State } from '../../binah/State.js';
import { routeDialogueKey, routePanelKey } from './KeyboardContextRoutes.js';
import { createKeyboardIntentMap } from './KeyboardIntentSchema.js';

export const keyIntentMap = createKeyboardIntentMap;

/**
 * Applies one key-down event without leaking overworld movement into blocking contexts.
 * @param {KeyboardEvent|Object} event Browser-like keyboard event.
 * @param {Record<string, string>} map Canonical keyboard intent map.
 * @param {Object} handlers Input facade callbacks for battle and path cancellation.
 */
export function handleKeyboardDown(event, map, handlers) {
	if (State.Dialogue.open) {
		routeDialogueKey(event);
		event.preventDefault?.();
		return;
	}

	if (State.UiPanel) {
		routePanelKey(event);
		event.preventDefault?.();
		return;
	}

	if (State.ActiveRealm === 'DEBATE' && /^[1-4]$/.test(event.key)) {
		handlers.commitBattle(Number(event.key) - 1);
		event.preventDefault?.();
		return;
	}

	const intent = map[event.key];
	if (!intent) {
		return;
	}

	window.AwtsmoosIntents[intent] = 1;
	if (['U', 'D', 'L', 'R'].includes(intent)) {
		handlers.cancelPath('manual-key');
	}
		event.preventDefault?.();
}

/**
 * Releases the global intent when a mapped keyboard vessel rises.
 * @param {KeyboardEvent|Object} event Browser-like keyboard event.
 * @param {Record<string, string>} map Canonical keyboard intent map.
 */
export function handleKeyboardUp(event, map) {
	const intent = map[event.key];
	if (intent) {
		window.AwtsmoosIntents[intent] = 0;
	}
}
