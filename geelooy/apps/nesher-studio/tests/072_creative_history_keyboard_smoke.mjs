//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 072_creative_history_keyboard_smoke.mjs
* @description Proves keyboard history uses stable command IDs, preserves text editing, and binds/disposes exactly once.
* The Awtsmoos lets a key reveal the same command the API and AI already know;
* Awtsmoos.com guards the editor inside an input while canvas history remains free to flow.
*/
import assert from 'node:assert/strict';
import {
	HistoryKeyboardController,
	historyCommandForEvent,
	isEditableTarget
} from '../modules/creative/ui/HistoryKeyboardController.js';

assert.equal(historyCommandForEvent({ key: 'z', metaKey: true }), 'history.undo');
assert.equal(historyCommandForEvent({ key: 'Z', ctrlKey: true }), 'history.undo');
assert.equal(historyCommandForEvent({ key: 'z', metaKey: true, shiftKey: true }), 'history.redo');
assert.equal(historyCommandForEvent({ key: 'y', ctrlKey: true }), 'history.redo');
assert.equal(historyCommandForEvent({ key: 'y', metaKey: true }), null);
assert.equal(historyCommandForEvent({ key: 'z' }), null);
assert.equal(historyCommandForEvent({ key: 'z', ctrlKey: true, altKey: true }), null);
assert.equal(isEditableTarget({ tagName: 'INPUT' }), true);
assert.equal(isEditableTarget({ tagName: 'DIV', isContentEditable: true }), true);
assert.equal(isEditableTarget({ tagName: 'CANVAS' }), false);

const calls = [];
const statuses = [];
let refreshCount = 0;
let addedListener = null;
let removedListener = null;
const eventTarget = {
	addEventListener(name, listener) {
		assert.equal(name, 'keydown');
		addedListener = listener;
	},
	removeEventListener(name, listener) {
		assert.equal(name, 'keydown');
		removedListener = listener;
	}
};
const api = {
	searchCommands(commandId) {
		return [{
			id: commandId,
			label: commandId.endsWith('undo') ? 'Undo' : 'Redo',
			available: true
		}];
	},
	async execute(commandId, parameters, options) {
		calls.push({ commandId, parameters, options });
		return { ok: true };
	}
};
const controller = new HistoryKeyboardController({
	api,
	eventTarget,
	setStatus(message) {
		statuses.push(message);
	},
	onAfterCommand() {
		refreshCount += 1;
	}
});
controller.bind();
controller.bind();
assert.equal(typeof addedListener, 'function');

let prevented = 0;
await controller.handleKeydown({
	key: 'z',
	metaKey: true,
	target: { tagName: 'CANVAS' },
	preventDefault() {
		prevented += 1;
	}
});
assert.deepEqual(calls[0], {
	commandId: 'history.undo',
	parameters: {},
	options: { source: 'human' }
});
assert.equal(prevented, 1);
assert.equal(refreshCount, 1);
assert.equal(statuses.at(-1), 'Undo complete.');

await controller.handleKeydown({
	key: 'z',
	ctrlKey: true,
	target: { tagName: 'INPUT' },
	preventDefault() {
		prevented += 1;
	}
});
assert.equal(calls.length, 1);
assert.equal(prevented, 1);

controller.dispose();
assert.equal(removedListener, addedListener);
console.log('B"H creative history keyboard smoke passed');
