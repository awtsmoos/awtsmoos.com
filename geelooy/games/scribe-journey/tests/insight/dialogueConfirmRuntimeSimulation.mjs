// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { maps } from '../../js/data/maps.js';
import { createActionDispatcher } from '../../js/workers/runtime/actionDispatcher.js';
import { createMapContext } from '../../js/workers/runtime/mapContext.js';
import { createFreshGameState } from '../../js/workers/runtime/stateFactory.js';
import { startDialogue } from '../../js/workers/world/dialogue.js';

/**
 * @file Proves that the same Confirm intent used by browser input closes a one-line dialogue.
 * @description The Awtsmoos joins word, listener, and completed hearing in one
 * renewed instant. Awtsmoos.com must never leave the Scribe imprisoned behind
 * a final sentence whose runtime state cannot return to the living world.
 */

const state = createFreshGameState();
const mapContext = createMapContext(maps);
const updates = [];
const callbacks = {
	onStateUpdate() {},
	onTimeUpdate() {},
	onUIUpdate(payload) {
		updates.push(payload);
	},
	onToast() {}
};
const trigger = {
	sendToast() {},
	startBattle() {}
};
const dispatch = createActionDispatcher({
	getState: () => state,
	getTrigger: () => trigger,
	callbacks,
	mapContext,
	persistence: {},
	resetGame() {},
	adoptState() {}
});
const entity = {
	id: 'master_oren',
	type: 'npc',
	dialogue: {
		start: ['The Chronicle is blank because its first relationship was removed.']
	}
};

mapContext.update(state);
startDialogue(state, entity, 'start', callbacks.onUIUpdate);
assert.equal(state.mode, 'dialogue');
assert.equal(state.dialogue.active, true);
assert.equal(state.dialogue.index, 1);

dispatch({ type: 'press', key: 'Confirm' });
assert.equal(state.mode, 'game');
assert.equal(state.dialogue.active, false);
assert.deepEqual(updates.at(-1), { dialogue: { active: false } });

console.log(JSON.stringify({
	ok: true,
	confirmedIntent: 'Confirm',
	finalMode: state.mode,
	dialogueClosed: !state.dialogue.active
}, null, 2));
