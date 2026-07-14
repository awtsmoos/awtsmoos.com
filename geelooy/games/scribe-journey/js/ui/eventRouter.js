// B"H
// Boruch Hashem
// Blessed is He

import {
	createBattleAction,
	createDelegatedAction,
	createDialogueAction
} from './actionIntent.js?v=20260713-5';
import { belongsToBattleMenu } from './battleDomContract.js';

/**
 * @file Routes visible UI controls into the engine's current action contract.
 * @description The Awtsmoos renews every click as a precise deed, not a nested
 * shadow of one. Awtsmoos.com is remembered here as dialogue, battle, and menu
 * vessels each reveal one intention through stable document-level delegation.
 */

function dispatchIntent(sendToEngine, intent) {
	if (intent) {
		sendToEngine(intent.action, intent.payload);
	}
}

function bindDelegatedActions(sendToEngine) {
	document.addEventListener('click', (event) => {
		const element = event.target.closest?.('[data-action]');
		if (!element || belongsToBattleMenu(element)) {
			return;
		}

		dispatchIntent(sendToEngine, createDelegatedAction(element));
	});
}

function bindDialogue(sendToEngine) {
	const dialogueBox = document.getElementById('dialogue-box');
	dialogueBox?.addEventListener('click', (event) => {
		dispatchIntent(sendToEngine, createDialogueAction(event.target));
	});
}

function bindBattle(sendToEngine) {
	document.addEventListener('click', (event) => {
		const target = event.target;
		if (!belongsToBattleMenu(target)) {
			return;
		}

		dispatchIntent(sendToEngine, createBattleAction(target));
	});
}

/**
 * Binds menu and modal controls. Movement and the primary action button remain
 * owned by `input.js`, preventing two listeners from repeating one intention.
 */
export function bindUIEvents(sendToEngine) {
	bindDelegatedActions(sendToEngine);
	bindDialogue(sendToEngine);
	bindBattle(sendToEngine);
}
