//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 075_creative_source_order_smoke.mjs
* @description Proves source selection stays editor-only while layer reorder is universal, transactional, and undoable.
* The Awtsmoos lets attention move without history, while creative order leaves a reversible trace;
* Awtsmoos.com proves human, JSON, and AI can share source intent through one command interface.
*/
import assert from 'node:assert/strict';
import { installCreativeRuntime } from '../modules/creative/runtime/installCreativeRuntime.js';
import { createState } from '../modules/state.js';

const state = createState();
const scene = state.project.scenes[0];
for (const source of [
	makeSource('source-a', 'Alpha'),
	makeSource('source-b', 'Beta'),
	makeSource('source-c', 'Gamma')
]) {
	scene.sources.push(source);
	scene.sourceIds.push(source.id);
}
const creative = installCreativeRuntime(state, { exposeGlobal: false });
const commandIds = creative.api.commands().map((item) => item.id);
assert.ok(commandIds.includes('stage.source.select'));
assert.ok(commandIds.includes('stage.source.reorder'));

const historyBeforeSelection = state.project.undo.past.length;
await creative.ai.execute('stage.source.select', { sourceId: 'source-b' });
assert.equal(state.selectedId, 'source-b');
assert.equal(state.project.undo.past.length, historyBeforeSelection);

const reorder = await creative.api.executeJson({
	commandId: 'stage.source.reorder',
	parameters: {
		sourceId: 'source-b',
		targetId: 'source-a'
	},
	source: 'api'
});
assert.deepEqual(reorder.result.order, ['source-b', 'source-a', 'source-c']);
assert.deepEqual(state.sources.map((source) => source.id), ['source-b', 'source-a', 'source-c']);
assert.equal(state.project.undo.past.length, historyBeforeSelection + 1);

await creative.api.execute('history.undo', {}, { source: 'human' });
assert.deepEqual(state.sources.map((source) => source.id), ['source-a', 'source-b', 'source-c']);
await creative.api.execute('history.redo', {}, { source: 'human' });
assert.deepEqual(state.sources.map((source) => source.id), ['source-b', 'source-a', 'source-c']);
await assert.rejects(() => creative.api.execute(
	'stage.source.reorder',
	{ sourceId: 'source-b', targetId: 'source-b' },
	{ source: 'human' }
));
console.log('B"H creative source order smoke passed');

/** Creates one simple source whose identity and geometry survive command-history snapshots. */
function makeSource(id, name) {
	return {
		id,
		name,
		type: 'text',
		x: 0,
		y: 0,
		w: 320,
		h: 180,
		baseW: 320,
		baseH: 180,
		crop: { left: 0, top: 0, right: 0, bottom: 0 }
	};
}
