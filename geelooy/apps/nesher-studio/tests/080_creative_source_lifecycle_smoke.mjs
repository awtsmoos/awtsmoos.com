//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 080_creative_source_lifecycle_smoke.mjs
* @description Proves source ordering, layer movement, duplicate, remove, Undo/Redo, sourceIds parity, and history-aware runtime cleanup.
* The Awtsmoos lets layers move and depart while stable identity and living media remain truthful across time;
* Awtsmoos.com resolves the current hydrated Scene for every proof, while reusable assertions breathe in a separate rhyme.
*/
import assert from 'node:assert/strict';
import { installCreativeRuntime } from '../modules/creative/runtime/installCreativeRuntime.js';
import { createState } from '../modules/state.js';
import {
	assertLifecycleOrder,
	assertLifecycleParity,
	currentLifecycleScene,
	makeLifecycleSource
} from './sourceLifecycleSmokeSupport.mjs';

const state = createState();
const seedScene = currentLifecycleScene(state);
const stopped = [];
const removedNodes = [];
const sources = [
	makeLifecycleSource('source-a', 'Alpha'),
	makeLifecycleSource('source-b', 'Beta'),
	makeLifecycleSource('source-c', 'Gamma'),
	makeLifecycleSource('source-runtime', 'Runtime', {
		type: 'browser',
		stream: {
			getTracks() {
				return [{
					stop() {
						stopped.push('track');
					}
				}];
			}
		},
		node: {
			remove() {
				removedNodes.push('node');
			}
		}
	})
];
seedScene.sources.push(...sources);
seedScene.sourceIds = seedScene.sources.map((source) => source.id);
state.selectedId = 'source-a';
const creative = installCreativeRuntime(state, { exposeGlobal: false });

await run('stage.source.reorder', { sourceId: 'source-a', targetId: 'source-c' });
assertLifecycleOrder(state, ['source-b', 'source-a', 'source-c', 'source-runtime']);
await run('stage.source.layer.top', { sourceId: 'source-a' });
assertLifecycleOrder(state, ['source-b', 'source-c', 'source-runtime', 'source-a']);
await run('stage.source.layer.bottom', { sourceId: 'source-a' });
assertLifecycleOrder(state, ['source-a', 'source-b', 'source-c', 'source-runtime']);
await run('stage.source.layer.up', { sourceId: 'source-a' });
assertLifecycleOrder(state, ['source-b', 'source-a', 'source-c', 'source-runtime']);
await run('stage.source.layer.down', { sourceId: 'source-a' });
assertLifecycleOrder(state, ['source-a', 'source-b', 'source-c', 'source-runtime']);

const noOpDepth = state.project.undo.past.length;
await assert.rejects(() => run('stage.source.layer.bottom', { sourceId: 'source-a' }));
assert.equal(state.project.undo.past.length, noOpDepth);

const duplicate = await run('stage.source.duplicate', { sourceId: 'source-b' });
const copyId = duplicate.result.id;
const copyNode = state.sources.find((source) => source.id === copyId).node;
assert.notEqual(copyId, 'source-b');
assert.equal(state.selectedId, copyId);
assertLifecycleParity(state);
await run('history.undo');
assert.equal(state.sources.some((source) => source.id === copyId), false);
await run('history.redo');
assert.equal(state.sources.find((source) => source.id === copyId).node, copyNode);
assertLifecycleParity(state);

state.project.undo.limit = 1;
state.selectedId = 'source-runtime';
await run('stage.source.remove', { sourceId: 'source-runtime' });
assert.equal(stopped.length, 0);
assert.equal(removedNodes.length, 0);
await run('history.undo');
const restoredRuntime = state.sources.find((source) => source.id === 'source-runtime');
assert.equal(restoredRuntime.stream, sources[3].stream);
assert.equal(restoredRuntime.node, sources[3].node);
await run('history.redo');
assert.equal(state.sources.some((source) => source.id === 'source-runtime'), false);
await run('stage.source.duplicate', { sourceId: 'source-b' });
assert.equal(stopped.length, 1);
assert.equal(removedNodes.length, 1);
assertLifecycleParity(state);
console.log('B"H creative source lifecycle smoke passed');

/** Executes one command through the same public surface used by human and machine operators. */
function run(commandId, parameters = {}) {
	return creative.api.execute(commandId, parameters, { source: 'human' });
}
