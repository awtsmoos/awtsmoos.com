//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 079_source_runtime_history_fidelity_smoke.mjs
* @description Proves circular runtime source handles stay outside portable JSON yet preserve exact identity through reorder, Undo, and Redo.
* The Awtsmoos lets living node and stream oros remain beyond JSON while stable source identity carries them through time;
* Awtsmoos.com proves portable persistence and runtime history can coexist without circular-clone failure or media decline.
*/
import assert from 'node:assert/strict';
import { installCreativeRuntime } from '../modules/creative/runtime/installCreativeRuntime.js';
import { sourceRuntimeResourceStats } from '../modules/creative/history/SourceRuntimeResourceLedger.js';
import { serializeProject } from '../modules/project/Project.js';
import { createState } from '../modules/state.js';

const state = createState();
const scene = state.project.scenes[0];
const first = makeRuntimeSource('runtime-a', 'Alpha');
const second = makeRuntimeSource('runtime-b', 'Beta');
scene.sources.push(first, second);
scene.sourceIds.push(first.id, second.id);
const creative = installCreativeRuntime(state, {
	exposeGlobal: false
});

const portable = serializeProject(state.project);
const portableSources = portable.scenes[0].sources;
assert.equal(JSON.stringify(portable).includes('runtime-a'), true);
assert.equal(portableSources[0].node, undefined);
assert.equal(portableSources[0].stream, undefined);
assert.equal(portableSources[0].meta.objectUrl, undefined);

await creative.api.execute('stage.source.reorder', {
	sourceId: second.id,
	targetId: first.id
}, {
	source: 'human'
});
assert.deepEqual(state.sources.map((source) => source.id), [second.id, first.id]);
assertRuntimeIdentity(state.sources, first, second);
assert.deepEqual(sourceRuntimeResourceStats(state), {
	entries: 2,
	nodes: 2,
	streams: 2,
	objectUrls: 2
});

await creative.api.execute('history.undo', {}, {
	source: 'human'
});
assert.deepEqual(state.sources.map((source) => source.id), [first.id, second.id]);
assertRuntimeIdentity(state.sources, first, second);
await creative.api.execute('history.redo', {}, {
	source: 'human'
});
assert.deepEqual(state.sources.map((source) => source.id), [second.id, first.id]);
assertRuntimeIdentity(state.sources, first, second);
console.log('B"H source runtime history fidelity smoke passed');

/** Creates one source whose circular runtime handles would break naive JSON cloning. */
function makeRuntimeSource(id, name) {
	const node = {
		id: `${id}-node`
	};
	const stream = {
		id: `${id}-stream`,
		getTracks() {
			return [];
		}
	};
	node.self = node;
	stream.self = stream;
	return {
		id,
		name,
		type: 'canvas',
		node,
		stream,
		x: 0,
		y: 0,
		w: 320,
		h: 180,
		baseW: 320,
		baseH: 180,
		meta: {
			objectUrl: `blob:${id}`
		}
	};
}

/** Proves each hydrated source received its original runtime object identities by stable source ID. */
function assertRuntimeIdentity(sources, first, second) {
	for (const original of [first, second]) {
		const restored = sources.find((source) => source.id === original.id);
		assert.equal(restored.node, original.node);
		assert.equal(restored.stream, original.stream);
		assert.equal(restored.meta.objectUrl, original.meta.objectUrl);
	}
}
