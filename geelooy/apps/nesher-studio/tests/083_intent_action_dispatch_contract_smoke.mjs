//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 083_intent_action_dispatch_contract_smoke.mjs
* @description Proves modern intent-model action shapes and historic aliases reach commands, lazy workspaces, workstation depth, and contained error reporting.
* The Awtsmoos lets one action grammar reveal many doors while backward-compatible vessels keep older callers in the light;
* Awtsmoos.com proves Create and More may name their destinations declaratively and still arrive through the navigator right.
*/
import assert from 'node:assert/strict';
import { IntentActionDispatcher } from '../modules/ui/intent/IntentActionDispatcher.js';

const calls = [];
const statuses = [];
const dispatcher = new IntentActionDispatcher({
	api: {
		async execute(commandId, parameters, options) {
			calls.push(['command', commandId, parameters, options]);
			return {
				ok: true,
				noOp: false
			};
		}
	},
	navigator: {
		async openPage(page, focus, message) {
			calls.push(['workspace', page, focus, message]);
			return page;
		}
	},
	onBeforeLeave() {
		calls.push(['before-leave']);
	},
	onWorkstation() {
		calls.push(['workstation']);
		return 'stage-workstation';
	},
	onAfterCommand(result) {
		calls.push(['after-command', result.ok]);
	},
	setStatus(message) {
		statuses.push(['global', message]);
	},
	setSheetStatus(message, error) {
		statuses.push(['sheet', message, error]);
	}
});

await dispatcher.dispatch({
	kind: 'command',
	commandId: 'project.scene.create',
	label: 'New Scene',
	parameters: {
		name: 'Scene'
	}
});
await dispatcher.dispatch({
	kind: 'workspace',
	page: 'sources',
	label: 'Add Media'
});
await dispatcher.dispatch({
	workspace: 'audio',
	label: 'Legacy Audio'
});
await dispatcher.dispatch({
	kind: 'workstation',
	label: 'Stage Workstation'
});
await dispatcher.dispatch({
	workstation: true,
	label: 'Legacy Workstation'
});
const unknown = await dispatcher.dispatch({
	kind: 'mystery'
});

assert.deepEqual(calls[0], [
	'command',
	'project.scene.create',
	{ name: 'Scene' },
	{ source: 'human' }
]);
assert.equal(calls.some((call) => call[0] === 'workspace' && call[1] === 'sources'), true);
assert.equal(calls.some((call) => call[0] === 'workspace' && call[1] === 'audio'), true);
assert.equal(calls.filter((call) => call[0] === 'workstation').length, 2);
assert.equal(calls.filter((call) => call[0] === 'before-leave').length, 4);
assert.equal(statuses.some((entry) => entry.includes('New Scene complete.')), true);
assert.equal(statuses.at(-1)[1], 'Unknown Studio intent action.');
assert.equal(statuses.at(-1)[2], true);
assert.equal(unknown, null);
console.log('B"H intent action dispatch contract smoke passed');
