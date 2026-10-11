// B"H
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	createMeadowTreeGroup,
	clearMeadowTreeArchetypes,
	MEADOW_TREE_KINDS
} from '../src/adapters/native/meadowTreeFactory.js';
import { createMeadowTreeWindController } from '../src/core/tzomayach/MeadowTreeWindController.js';
import { createProceduralTreeNativeGroup } from '../src/adapters/native/treeMeshFactory.js';

test('meadow tree group carries branch and foliage meshes plus wind metadata', () => {
	clearMeadowTreeArchetypes();
	const tree = createMeadowTreeGroup({ kind: 'olive', seed: 'tree-test-1', position: [10, 0, 20] });
	assert.equal(tree.children.length, 2);
	const names = tree.children.map(child => child.name);
	assert.ok(names.some(name => /bark/i.test(name)), 'bark mesh present');
	assert.ok(names.some(name => /leaves/i.test(name)), 'foliage mesh present');
	const meta = tree.userData.meadowTree;
	assert.ok(meta, 'wind metadata present');
	assert.equal(meta.kind, 'olive');
	assert.ok(meta.foliage, 'foliage mesh referenced');
	assert.ok(Number.isFinite(meta.swayPhase) && Number.isFinite(meta.swayAmp), 'sway params finite');
	assert.deepEqual([tree.position.x, tree.position.z], [10, 20]);
	for (const kind of Object.keys(MEADOW_TREE_KINDS)) {
		const other = createMeadowTreeGroup({ kind, seed: `tree-test-${kind}` });
		assert.equal(other.userData.meadowTree.kind, kind);
	}
});

test('archetype geometry is shared across same-kind trees but meshes stay independent', () => {
	clearMeadowTreeArchetypes();
	const first = createMeadowTreeGroup({ kind: 'oak', seed: 'shared-a' });
	const second = createMeadowTreeGroup({ kind: 'oak', seed: 'shared-b' });
	const foliageA = first.userData.meadowTree.foliage;
	const foliageB = second.userData.meadowTree.foliage;
	assert.notEqual(foliageA, foliageB, 'independent foliage meshes');
	const sharedGeometry = foliageA.geometry === foliageB.geometry;
	const sharedArchetype = first.userData.meadowTree.archetype === second.userData.meadowTree.archetype;
	assert.ok(sharedArchetype === sharedGeometry, 'geometry sharing matches archetype key');
});

test('foliage variance bakes sunlit/shade spread into vertex colors', () => {
	clearMeadowTreeArchetypes();
	const tree = createMeadowTreeGroup({ kind: 'pine', seed: 'variance-test' });
	const colors = tree.userData.meadowTree.foliage.geometry.attributes.color.array;
	let min = Infinity;
	let max = -Infinity;
	for (let index = 0; index < colors.length; index += 4) {
		const brightness = colors[index] + colors[index + 1] + colors[index + 2];
		if (brightness < min) min = brightness;
		if (brightness > max) max = brightness;
	}
	assert.ok(max - min > 0.25, `canopy has light/shade spread (min ${min.toFixed(2)}, max ${max.toFixed(2)})`);
});

test('wind controller sways foliage with per-tree phase', () => {
	clearMeadowTreeArchetypes();
	const controller = createMeadowTreeWindController();
	const first = createMeadowTreeGroup({ kind: 'olive', seed: 'wind-a' });
	const second = createMeadowTreeGroup({ kind: 'olive', seed: 'wind-b' });
	controller.registerTree(first).registerTree(second);
	assert.equal(controller.count, 2);
	controller.update(1.25, { direction: [1, 0], strength: 1 });
	const ra = first.userData.meadowTree.foliage.rotation;
	const rb = second.userData.meadowTree.foliage.rotation;
	assert.ok(Math.abs(ra.z) > 1e-6 || Math.abs(ra.x) > 1e-6, 'first tree sways');
	assert.ok(
		Math.abs(ra.z - rb.z) > 1e-9 || Math.abs(ra.x - rb.x) > 1e-9,
		'trees sway with different phase'
	);
	controller.update(1.25, { direction: [1, 0], strength: 0 });
	const calm = first.userData.meadowTree.foliage.rotation;
	assert.ok(Math.abs(calm.z) < 1e-9 && Math.abs(calm.x) < 1e-9, 'zero wind means zero sway');
	controller.unregisterTree(first);
	assert.equal(controller.count, 1);
});

test('legacy tree factory still works and accepts generation options', () => {
	const tree = createProceduralTreeNativeGroup({ preset: 'oak', generationOptions: { detail: 'low' } });
	assert.equal(tree.children.length, 2);
	assert.ok(tree.userData.awtsmoosProceduralTree, 'legacy userData preserved');
});
