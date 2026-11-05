// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorStreamingAdapter.test.js
 * @description Proves the streaming adapter indexes every definition, mounts
 * only nearby cells, delegates mesh lookup (the universe actor-tracking path),
 * regenerates definitions, and reports honest diagnostics.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createUniverseActorDirector } from './MitzvahWorldUniverseActors.js';
import { MitzvahWorldCreatorStreamingAdapter } from './MitzvahWorldCreatorStreamingAdapter.js';

function fakeRuntime() {
	return {
		mainOctree: { insert: () => true, remove: () => {} },
		model: { position: { x: 0, z: 0 } },
		scene: {
			add: mesh => {
				mesh.parent = { remove: () => {} };
			}
		}
	};
}

function makeAdapter(runtime = fakeRuntime()) {
	return new MitzvahWorldCreatorStreamingAdapter(runtime, {
		cellSize: 64,
		dependencies: {
			createColliders: definition => [{ colliderFor: definition.id }],
			createMesh: definition => ({ id: definition.id, parent: null })
		}
	});
}

function definition(id, x = 0, z = 0) {
	return {
		color: '#8d6a45',
		id,
		position: { x, y: 1, z },
		rotation: { y: 0 },
		shape: 'box',
		size: { x: 2, y: 2, z: 0.45 }
	};
}

test('mount indexes the definition and exposes its live mesh', () => {
	const adapter = makeAdapter();
	adapter.mount(definition('wall-1', 0, 0));

	const diagnostics = adapter.diagnostics();
	assert.equal(diagnostics.indexed, 1);
	assert.ok(diagnostics.ids.includes('wall-1'));
	assert.equal(adapter.meshFor('wall-1')?.id, 'wall-1');
	assert.equal(adapter.meshFor('missing'), null);
});

test('update mounts only nearby cells and retires distant meshes', () => {
	const adapter = makeAdapter();
	adapter.mount(definition('near', 0, 0));
	adapter.mount(definition('far', 500, 500));

	adapter.update({ x: 0, z: 0 }, true);
	let diagnostics = adapter.diagnostics();
	assert.ok(diagnostics.mountedIds.includes('near'), 'nearby cell must mount');
	assert.ok(!diagnostics.mountedIds.includes('far'), 'distant cell must stay semantic-only');
	assert.equal(diagnostics.indexed, 2, 'both definitions stay indexed');
	assert.equal(adapter.meshFor('far'), null);

	adapter.update({ x: 500, z: 500 }, true);
	diagnostics = adapter.diagnostics();
	assert.ok(diagnostics.mountedIds.includes('far'), 'traveling mounts the far cell');
	assert.ok(!diagnostics.mountedIds.includes('near'), 'the left cell retires');
	assert.equal(adapter.meshFor('far')?.id, 'far');
});

test('remove clears index, live mount, and mesh lookup', () => {
	const adapter = makeAdapter();
	adapter.mount(definition('wall-1', 0, 0));
	assert.equal(adapter.remove('wall-1'), true);
	assert.equal(adapter.diagnostics().indexed, 0);
	assert.equal(adapter.meshFor('wall-1'), null);
	assert.equal(adapter.remove('wall-1'), false);
});

test('updateDefinition regenerates through the streaming adapter', () => {
	const adapter = makeAdapter();
	adapter.mount(definition('wall-1', 0, 0));
	const next = definition('wall-1', 0, 0);
	next.size.x = 9;
	adapter.updateDefinition(next);
	assert.equal(adapter.meshFor('wall-1')?.id, 'wall-1');
	assert.equal(adapter.diagnostics().mounted, 1);
});

test('replace swaps the whole world and clear empties everything', () => {
	const adapter = makeAdapter();
	adapter.mount(definition('old', 0, 0));
	adapter.replace([definition('new-1', 0, 0), definition('new-2', 10, 0)], { x: 0, z: 0 });

	let diagnostics = adapter.diagnostics();
	assert.equal(diagnostics.indexed, 2);
	assert.ok(diagnostics.ids.includes('new-1'));
	assert.ok(!diagnostics.ids.includes('old'));

	adapter.clear();
	diagnostics = adapter.diagnostics();
	assert.equal(diagnostics.indexed, 0);
	assert.equal(diagnostics.mounted, 0);
	assert.deepEqual(diagnostics.failures, {});
});

test('mount failure records the cell failure without breaking the index', () => {
	const runtime = fakeRuntime();
	const adapter = new MitzvahWorldCreatorStreamingAdapter(runtime, {
		cellSize: 64,
		dependencies: {
			createColliders: () => [{ colliderFor: 'x' }],
			createMesh: () => {
				throw new Error('MESH_BOOM');
			}
		}
	});
	assert.throws(() => adapter.mount(definition('bad', 0, 0)), /MESH_BOOM/);
	assert.equal(adapter.diagnostics().indexed, 0, 'failed mounts must not pollute the index');
});

test('actor tracking reaches mounted character meshes through the adapter', () => {
	// This is the exact path MitzvahWorldCreatorSessionActions.trackUniverseActors
	// takes; before meshFor existed on the streaming adapter it silently no-oped.
	const runtime = fakeRuntime();
	const adapter = new MitzvahWorldCreatorStreamingAdapter(runtime, {
		cellSize: 64,
		dependencies: {
			createColliders: () => [],
			createMesh: definition => ({
				id: definition.id,
				parent: null,
				position: { x: 4, y: 1, z: -2 },
				rotation: { y: 0 }
			})
		}
	});
	adapter.mount(definition('npc-1', 4, -2));

	const director = createUniverseActorDirector({ environment: {} });
	const mesh = adapter.meshFor('npc-1');
	assert.ok(mesh, 'streaming adapter must expose the mounted mesh');
	assert.equal(director.track('npc-1', mesh, 'npc'), true);
	assert.equal(director.count(), 1);
	director.update(1.5);
	assert.equal(mesh.position.x, 4, 'npc idle must not move the anchor');
});
