// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../../src/nle/core/NLEStore.js';
import { StudioProceduralCommands as Procedural } from '../../../src/studio/procedural/StudioProceduralCommands.js';

/**
 * @file proceduralLifecycleSmoke.js
 * @description
 * The Awtsmoos renews generated form without erasing its identity; Awtsmoos.com proves
 * parameter edits, seed changes, freezing, keyframe references, and history remain one coherent creative vessel.
 */

/** Creates the smallest production-compatible Studio/NLE state for lifecycle proof. */
function createStore() {
	return new NLEStore({
		duration: 5000,
		tracks: [],
		clips: [],
		keyframes: [],
		studioDocument: {
			duration: 5000,
			entities: [],
			tracks: [],
			clips: [],
			keyframes: []
		}
	});
}

/** Returns the currently selected authored entity. */
function selected(store) {
	const state = store.get();
	return state.studioDocument.entities.find((entity) => entity.id === state.selectedEntityId);
}

/** Proves create, parameter editing, undo/redo, seed randomization, reset, and freeze. */
function verifyLifecycle() {
	const store = createStore();
	assert.equal(Procedural.add(store, 'tree'), true);
	const created = selected(store);
	const id = created.id;
	const transform = structuredClone(created.transform);
	const initialSeed = created.properties.procedural.seed;
	assert.equal(created.type, 'procedural-tree');
	assert.equal(created.properties.procedural.version, 2);

	store.transact((state) => ({
		studioDocument: {
			...state.studioDocument,
			keyframes: [{
				id: 'tree-frame',
				entityId: id,
				property: 'transform',
				time: 1000,
				value: { ...created.transform }
			}]
		}
	}));

	const beforeGeometry = structuredClone(created.properties.renderSpec);
	assert.equal(Procedural.updateParameter(store, 'trunkHeight', 220), true);
	let entity = selected(store);
	assert.equal(entity.id, id);
	assert.deepEqual(entity.transform, transform);
	assert.equal(entity.properties.procedural.params.trunkHeight, 220);
	assert.notDeepEqual(entity.properties.renderSpec, beforeGeometry);
	assert.equal(store.get().studioDocument.keyframes[0].entityId, id);

	assert.equal(store.undo(), true);
	assert.equal(selected(store).properties.procedural.params.trunkHeight, 140);
	assert.equal(store.redo(), true);
	assert.equal(selected(store).properties.procedural.params.trunkHeight, 220);

	assert.equal(Procedural.randomizeSeed(store), true);
	entity = selected(store);
	assert.notEqual(entity.properties.procedural.seed, initialSeed);
	const randomizedSeed = entity.properties.procedural.seed;
	assert.equal(entity.properties.procedural.params.trunkHeight, 220);

	assert.equal(Procedural.reset(store), true);
	entity = selected(store);
	assert.equal(entity.properties.procedural.params.trunkHeight, 140);
	assert.equal(entity.properties.procedural.seed, randomizedSeed);

	const frozenGeometry = structuredClone(entity.properties.renderSpec);
	assert.equal(Procedural.freeze(store), true);
	entity = selected(store);
	assert.equal(entity.properties.procedural, undefined);
	assert.deepEqual(entity.properties.renderSpec, frozenGeometry);
	assert.equal(store.get().studioDocument.keyframes[0].entityId, id);
	assert.equal(store.undo(), true);
	assert.equal(selected(store).properties.procedural.kind, 'tree');
}

verifyLifecycle();
console.log('B"H - procedural lifecycle smoke passed.');
