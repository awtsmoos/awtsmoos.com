// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRuntimeAdapter.test.js
 * @description Proves the runtime adapter mounts and removes primitives with
 * exact collider identities, refuses duplicate mounts, and regenerates one
 * mounted definition atomically — restoring the prior form when regeneration
 * fails.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldCreatorRuntimeAdapter } from './MitzvahWorldCreatorRuntimeAdapter.js';

function fakeRuntime() {
	return {
		mainOctree: {
			inserted: [],
			insert(collider) {
				this.inserted.push(collider);
				return true;
			},
			remove(collider) {
				const index = this.inserted.indexOf(collider);
				if (index >= 0) this.inserted.splice(index, 1);
			}
		},
		scene: {
			added: [],
			add(mesh) {
				this.added.push(mesh);
				mesh.parent = { remove: () => {} };
			}
		}
	};
}

function makeAdapter(runtime, failOnIds = new Set(), failOnceIds = new Set()) {
	return new MitzvahWorldCreatorRuntimeAdapter(runtime, {
		createColliders: definition => [{ colliderFor: definition.id }],
		createMesh: definition => {
			if (failOnceIds.has(definition.id)) {
				failOnceIds.delete(definition.id);
				throw new Error(`MESH_BOOM:${definition.id}`);
			}
			if (failOnIds.has(definition.id)) throw new Error(`MESH_BOOM:${definition.id}`);
			return { id: definition.id, parent: null };
		}
	});
}

function definition(id, size = { x: 2, y: 2, z: 0.45 }) {
	return {
		color: '#8d6a45',
		id,
		position: { x: 1, y: 1, z: 1 },
		rotation: { y: 0 },
		shape: 'box',
		size: { ...size }
	};
}

test('mount inserts mesh and colliders; remove releases the exact identities', () => {
	const runtime = fakeRuntime();
	const adapter = makeAdapter(runtime);
	const receipt = adapter.mount(definition('wall-1'));

	assert.equal(receipt.id, 'wall-1');
	assert.equal(runtime.scene.added.length, 1);
	assert.equal(runtime.mainOctree.inserted.length, 1);
	assert.equal(adapter.diagnostics().mounted, 1);
	assert.equal(adapter.meshFor('wall-1'), receipt.mesh);

	assert.equal(adapter.remove('wall-1'), true);
	assert.equal(runtime.mainOctree.inserted.length, 0, 'colliders must be released');
	assert.equal(adapter.diagnostics().mounted, 0);
	assert.equal(adapter.remove('wall-1'), false, 'second remove is a no-op');
	assert.equal(adapter.meshFor('wall-1'), null);
});

test('mount refuses duplicates and unready runtimes', () => {
	const adapter = makeAdapter(fakeRuntime());
	adapter.mount(definition('wall-1'));
	assert.throws(() => adapter.mount(definition('wall-1')), /CREATOR_RUNTIME_EXISTS:wall-1/);

	const bare = new MitzvahWorldCreatorRuntimeAdapter({});
	assert.throws(() => bare.mount(definition('wall-2')), /CREATOR_RUNTIME_NOT_READY/);
});

test('mount rolls back the mesh when a collider insert fails', () => {
	const runtime = fakeRuntime();
	runtime.mainOctree.insert = () => false;
	const adapter = makeAdapter(runtime);
	assert.throws(() => adapter.mount(definition('wall-1')), /CREATOR_COLLIDER_OUTSIDE_WORLD:wall-1/);
	assert.equal(adapter.diagnostics().mounted, 0);
	assert.equal(runtime.scene.added.length, 1, 'mesh was added then detached');
});

test('updateDefinition regenerates the mounted form under the same id', () => {
	const runtime = fakeRuntime();
	const adapter = makeAdapter(runtime);
	const before = adapter.mount(definition('wall-1'));

	const next = definition('wall-1', { x: 4, y: 1, z: 1 });
	next.position.x = 9;
	const receipt = adapter.updateDefinition(next);

	assert.equal(receipt.id, 'wall-1');
	assert.notEqual(receipt.mesh, before.mesh, 'mesh must be regenerated');
	assert.equal(receipt.definition, next);
	assert.equal(adapter.diagnostics().mounted, 1, 'exactly one mount must remain');
	assert.equal(runtime.mainOctree.inserted.length, 1, 'exactly one collider must remain');
	assert.equal(runtime.mainOctree.inserted[0].colliderFor, 'wall-1');
	assert.equal(adapter.meshFor('wall-1'), receipt.mesh);
});

test('updateDefinition refuses unknown ids', () => {
	const adapter = makeAdapter(fakeRuntime());
	assert.throws(() => adapter.updateDefinition(definition('ghost')), /CREATOR_OBJECT_NOT_FOUND:ghost/);
});

test('updateDefinition restores the prior form when regeneration fails', () => {
	const runtime = fakeRuntime();
	const failOnce = new Set();
	const adapter = makeAdapter(runtime, new Set(), failOnce);
	const before = adapter.mount(definition('wall-1'));
	const beforeMesh = before.mesh;

	// The regeneration mount fails once; the rollback remount must succeed.
	failOnce.add('wall-1');
	assert.throws(() => adapter.updateDefinition(definition('wall-1', { x: 9, y: 9, z: 9 })), /MESH_BOOM/);

	assert.equal(adapter.diagnostics().mounted, 1, 'the prior mount must be restored');
	assert.equal(adapter.meshFor('wall-1').id, 'wall-1');
	assert.notEqual(adapter.meshFor('wall-1'), beforeMesh, 'rollback remounts a fresh prior mesh');
	assert.equal(runtime.mainOctree.inserted.length, 1);
});

test('clear releases every mount without touching foreign geometry', () => {
	const runtime = fakeRuntime();
	runtime.scene.add({ id: 'native', parent: null });
	const adapter = makeAdapter(runtime);
	adapter.mount(definition('wall-1'));
	adapter.mount(definition('wall-2'));

	adapter.clear();
	assert.equal(adapter.diagnostics().mounted, 0);
	assert.equal(runtime.mainOctree.inserted.length, 0);
	assert.equal(runtime.scene.added.length, 3, 'clear detaches meshes; foreign mesh untouched');
});
