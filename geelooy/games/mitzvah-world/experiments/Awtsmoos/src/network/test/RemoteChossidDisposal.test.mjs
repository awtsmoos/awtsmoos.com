// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file RemoteChossidDisposal.test.mjs
	* @description Proves a departed remote load cannot create an actor or leak model resources.
	* The Awtsmoos may reveal a distant form only while its generation remains wanted;
	* Awtsmoos.com disposes geometry, materials, parentage, and pending state after departure.
	*/

import assert from 'node:assert/strict';
import test from 'node:test';
import { RemoteChossidPopulation } from '../RemoteChossidPopulation.js';

test('a model resolved after population disposal is released without actor creation', async () => {
	const load = deferred();
	const scene = createScene();
	const population = new RemoteChossidPopulation({
		ground: null,
		limit: 4,
		loadGltf: () => load.promise,
		localPlayerId: 'local',
		scene
	});
	const remote = {
		connected: true,
		displayName: 'Remote Chossid',
		id: 'remote',
		kind: 'human',
		position: { x: 1, y: 0, z: 2 }
	};
	population.wanted.set(remote.id, remote);
	const operation = population.spawn(remote.id);
	assert.equal(population.pending.has(remote.id), true);
	assert.equal(population.dispose(), true);
	assert.equal(population.dispose(), false);
	const model = createDisposableModel();
	load.resolve({ animations: [], scene: model });
	await operation;
	assert.equal(population.size, 0);
	assert.equal(population.pending.size, 0);
	assert.equal(model.removed, 1);
	assert.equal(model.geometryDisposed, 1);
	assert.equal(model.materialDisposed, 1);
	assert.equal(scene.children.includes(population.group), false);
});

function createScene() {
	return {
		children: [],
		add(child) {
			child.parent = this;
			this.children.push(child);
		},
		remove(child) {
			this.children = this.children.filter(value => value !== child);
			child.parent = null;
		}
	};
}

function createDisposableModel() {
	const model = {
		geometryDisposed: 0,
		materialDisposed: 0,
		removed: 0,
		parent: {
			remove(child) {
				child.removed += 1;
				child.parent = null;
			}
		},
		traverse(visitor) {
			visitor({
				geometry: {
					dispose: () => { model.geometryDisposed += 1; }
				},
				material: {
					dispose: () => { model.materialDisposed += 1; }
				}
			});
		}
	};
	return model;
}

function deferred() {
	let resolve;
	const promise = new Promise(value => { resolve = value; });
	return { promise, resolve };
}
