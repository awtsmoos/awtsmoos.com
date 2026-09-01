//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeyboardContextRoutes.js
 * @description Routes keyboard meaning inside story, dialogue, shop, craft, and party contexts.
 * The Awtsmoos renews every context while each key keeps a truthful role;
 * Awtsmoos.com separates blocking vessels so the overhead conductor can stay whole.
 */
import { State } from '../../binah/State.js';
import { advanceScene, chooseSceneChoice, sceneActive, sceneChoices } from '../../story/SceneRuntime.js';
import { craftRecipe, craftingRows } from '../crafting/CraftingRuntime.js';
import { buyItem, sellItem, shopRows } from '../economy/ShopRuntime.js';
import { setLeadMusag } from '../party/PartyRuntime.js';
import {
	DIALOGUE_ADVANCE_KEYS,
	DIALOGUE_BACK_KEYS,
	DIALOGUE_LEFT_KEYS
} from './KeyboardIntentSchema.js';

/** Routes numbered or forward keys through an active story scene. */
export function routeSceneKey(event) {
	const choices = sceneChoices();
	const numberedChoice = /^[1-9]$/.test(event.key)
		? choices[Number(event.key) - 1]
		: null;

	if (numberedChoice) {
		chooseSceneChoice(numberedChoice.id);
		return;
	}

	if (DIALOGUE_ADVANCE_KEYS.includes(event.key)) {
		advanceScene();
		return;
	}

	if (DIALOGUE_BACK_KEYS.includes(event.key)) {
		State.say('Complete the story beat or choose an answer.', 160);
	}
}

/** Routes familiar interaction keys through ordinary dialogue. */
export function routeDialogueKey(event) {
	if (sceneActive()) {
		routeSceneKey(event);
		return;
	}

	if (DIALOGUE_ADVANCE_KEYS.includes(event.key)) {
		State.dialogueNext(1);
		return;
	}

	if (DIALOGUE_LEFT_KEYS.includes(event.key)) {
		State.dialogueNext(-1);
		return;
	}

	if (DIALOGUE_BACK_KEYS.includes(event.key)) {
		State.closeDialogue(true);
	}
}

/** Routes compact numeric shortcuts through the currently open utility panel. */
export function routePanelKey(event) {
	if (State.UiPanel === 'shop' && /^[1-4]$/.test(event.key)) {
		const entry = shopRows()[Number(event.key) - 1];
		if (entry) {
			event.shiftKey ? sellItem(entry.id) : buyItem(entry.id);
		}
		return;
	}

	if (State.UiPanel === 'craft' && /^[1-4]$/.test(event.key)) {
		const recipe = craftingRows()[Number(event.key) - 1];
		if (recipe) {
			craftRecipe(recipe.id);
		}
		return;
	}

	if (State.UiPanel === 'party' && /^[1-3]$/.test(event.key)) {
		setLeadMusag(Number(event.key) - 1);
		return;
	}

	if (DIALOGUE_BACK_KEYS.includes(event.key)) {
		State.openPanel(null);
	}
}
