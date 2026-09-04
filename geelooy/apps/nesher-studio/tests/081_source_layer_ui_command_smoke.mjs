//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 081_source_layer_ui_command_smoke.mjs
* @description Proves every Stage layer/lifecycle button dispatches a public command and refreshes projections without invoking legacy mutation callbacks.
* The Awtsmoos lets each visible button become a doorway into the universal command tongue rather than a secret state hand;
* Awtsmoos.com keeps redraw, inspector, status, and source-list projection downstream of one canonical decree across the land.
*/
import assert from 'node:assert/strict';
import { bindLayerControls } from '../modules/app/layerBindings.js';

const calls = [];
const statuses = [];
let drawCount = 0;
let sourceRefreshCount = 0;
let inspectorRefreshCount = 0;
const dom = Object.fromEntries([
	'layerTop',
	'layerUp',
	'layerDown',
	'layerBottom',
	'duplicateSource',
	'removeSource'
].map((id) => [id, {}]));
const state = { selectedId: 'source-selected' };
bindLayerControls({
	dom,
	state,
	api: {
		async execute(commandId, parameters, options) {
			calls.push({ commandId, parameters, options });
			return { ok: true };
		}
	},
	drawStage() {
		drawCount += 1;
	},
	refreshSources() {
		sourceRefreshCount += 1;
	},
	refreshInspector() {
		inspectorRefreshCount += 1;
	},
	setStatus(message) {
		statuses.push(message);
	}
});

for (const id of Object.keys(dom)) {
	await dom[id].onclick();
}
assert.deepEqual(calls.map((call) => call.commandId), [
	'stage.source.layer.top',
	'stage.source.layer.up',
	'stage.source.layer.down',
	'stage.source.layer.bottom',
	'stage.source.duplicate',
	'stage.source.remove'
]);
for (const call of calls) {
	assert.deepEqual(call.parameters, { sourceId: 'source-selected' });
	assert.deepEqual(call.options, { source: 'human' });
}
assert.equal(drawCount, 6);
assert.equal(sourceRefreshCount, 6);
assert.equal(inspectorRefreshCount, 6);
assert.equal(statuses.length, 6);
console.log('B"H source layer UI command smoke passed');
