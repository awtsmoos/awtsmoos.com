/**
 * B"H
 * @module KeyboardInput
 * @description Keyboard movement, scenes, battle moves, shops, crafting, and party selection.
 */
import { State } from '../../binah/State.js';
import { advanceScene, chooseSceneChoice, sceneActive, sceneChoices } from '../../story/SceneRuntime.js';
import { craftRecipe, craftingRows } from '../crafting/CraftingRuntime.js';
import { buyItem, sellItem, shopRows } from '../economy/ShopRuntime.js';
import { setLeadMusag } from '../party/PartyRuntime.js';

export const keyIntentMap = () => ({
	ArrowUp:'U', w:'U', W:'U', ArrowDown:'D', s:'D', S:'D',
	ArrowLeft:'L', a:'L', A:'L', ArrowRight:'R', d:'R', D:'R',
	z:'A', Z:'A', Enter:'A', ' ':'A', x:'B', X:'B', Escape:'B'
});

const sceneKey = event => {
	const choices = sceneChoices();
	if (/^[1-9]$/.test(event.key) && choices[Number(event.key) - 1]) {
		chooseSceneChoice(choices[Number(event.key) - 1].id);
	} else if (['Enter', ' ', 'z', 'Z', 'ArrowRight', 'd', 'D'].includes(event.key)) {
		advanceScene();
	} else if (['x', 'X', 'Escape'].includes(event.key)) {
		State.say('Complete the story beat or choose an answer.', 160);
	}
};

const dialogueKey = event => {
	if (sceneActive()) sceneKey(event);
	else if (['Enter', ' ', 'z', 'Z', 'ArrowRight', 'd', 'D'].includes(event.key)) State.dialogueNext(1);
	else if (['ArrowLeft', 'a', 'A'].includes(event.key)) State.dialogueNext(-1);
	else if (['x', 'X', 'Escape'].includes(event.key)) State.closeDialogue(true);
};

const panelKey = event => {
	if (State.UiPanel === 'shop' && /^[1-4]$/.test(event.key)) {
		const entry = shopRows()[Number(event.key) - 1];
		if (entry) event.shiftKey ? sellItem(entry.id) : buyItem(entry.id);
	} else if (State.UiPanel === 'craft' && /^[1-4]$/.test(event.key)) {
		const recipe = craftingRows()[Number(event.key) - 1];
		if (recipe) craftRecipe(recipe.id);
	} else if (State.UiPanel === 'party' && /^[1-3]$/.test(event.key)) {
		setLeadMusag(Number(event.key) - 1);
	} else if (['Escape', 'x', 'X'].includes(event.key)) State.openPanel(null);
};

export const handleKeyboardDown = (event, map, handlers) => {
	if (State.Dialogue.open) {
		dialogueKey(event);
		event.preventDefault?.();
		return;
	}
	if (State.UiPanel) {
		panelKey(event);
		event.preventDefault?.();
		return;
	}
	if (State.ActiveRealm === 'DEBATE' && /^[1-4]$/.test(event.key)) {
		handlers.commitBattle(Number(event.key) - 1);
		event.preventDefault?.();
		return;
	}
	const intent = map[event.key];
	if (!intent) return;
	window.AwtsmoosIntents[intent] = 1;
	if (['U', 'D', 'L', 'R'].includes(intent)) handlers.cancelPath('manual-key');
	event.preventDefault?.();
};

export const handleKeyboardUp = (event, map) => {
	const intent = map[event.key];
	if (intent) window.AwtsmoosIntents[intent] = 0;
};
