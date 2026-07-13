// B"H
// Boruch Hashem
// Blessed is He

import { createDefaultGameState } from '../../js/data/database.js';
import { advanceDialogue, handleDialogueChoice, startDialogue } from '../../js/workers/world/dialogue.js';
import * as Quests from '../../js/workers/quests.js';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const state = createDefaultGameState();
state.db.quests = {
	dialogue_test: {
		id: 'dialogue_test',
		title: 'Meet Tamar',
		objectives: [
			{ id: 'speak', type: 'speak_npc', targetId: 'tamar', required: 1, text: 'Speak to Tamar' },
			{ id: 'choose', type: 'dialogue_choice', targetId: 'trust_tamar', required: 1, text: 'Trust Tamar' }
		]
	}
};
assert(Quests.accept(state, 'dialogue_test'), 'Dialogue quest could not be accepted.');
const updates = [];
const entity = {
	id: 'tamar',
	name: 'Tamar',
	dialogue: {
		start: [
			{ giveItem: 'scribe_reed' },
			{ text: 'Will you trust the living map?', choices: [{ id: 'trust_tamar', text: 'I will.', next: 'trusted' }] }
		],
		trusted: ['Then let every road remember its travelers.', 'end']
	}
};
startDialogue(state, entity, 'start', payload => updates.push(payload));
assert(state.player.inventory.some(item => item.id === 'scribe_reed'), 'Opening logic object did not safely grant its item.');
assert(Quests.getStatus(state, 'dialogue_test') === 'in_progress', 'Speak objective did not progress.');
advanceDialogue(state, payload => updates.push(payload), {});
assert(state.dialogue.choices.length === 1, 'Dialogue choice was not presented.');
handleDialogueChoice(state, 0, payload => updates.push(payload), { sendToast() {} });
assert(Quests.getStatus(state, 'dialogue_test') === 'ready', 'Dialogue choice objective did not progress.');
assert(state.player.questChoices.trust_tamar, 'Dialogue choice did not persist.');

console.log(JSON.stringify({
	ok: true,
	updates: updates.length,
	inventory: state.player.inventory.length,
	choiceStored: Boolean(state.player.questChoices.trust_tamar)
}, null, 2));
