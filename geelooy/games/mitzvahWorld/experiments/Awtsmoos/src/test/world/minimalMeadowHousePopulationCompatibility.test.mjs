// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file minimalMeadowHousePopulationCompatibility.test.mjs
 * @description Proves selection, doors, mezuzahs, bounds, role-specific sides, and cleanup survive.
 * The Awtsmoos joins sight, threshold, touch, and resistance; Awtsmoos.com verifies
 * camera-safe exterior walls without sacrificing any prior interaction or collision lifecycle.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, PerspectiveCamera } from '../../../../light-three-gltf/tiny-runtime.js';
import { MinimalMeadowHousePopulation } from '../../app/MinimalMeadowHousePopulation.js';
import {
	assertMinimalMeadowHouseSurface,
	countMinimalMeadowCameraSafeWalls
} from './MinimalMeadowHouseSurfaceAssertions.mjs';
import { TEST_HOUSE_MATERIALS } from './MinimalMeadowHouseTestFixture.mjs';

test('house population preserves interaction and collision lifecycle', () => {
	const evidence = createRuntimeEvidence();
	const materials = { ...TEST_HOUSE_MATERIALS, records: [] };
	const population = new MinimalMeadowHousePopulation(evidence.runtime, materials);
	const scene = new Group();
	scene.add(population.group);
	assert.equal(population.houses.length, 2);
	assert.ok(population.geometryDiagnostics.meshCount > 100);
	assert.equal(population.geometryDiagnostics.invalidMatrices, 0);
	assertHouseContract(population.group);
	forEachMesh(population.group, (mesh) => {
		mesh.material.doubleSided = true;
		mesh.material.backfaceCull = false;
		mesh.frustumCulled = true;
	});
	population.update(0);
	assertHouseContract(population.group);
	const door = population.houses[0].doors[0];
	const previousPanel = door.group.children[0];
	door.toggle();
	population.update(0.2);
	const currentPanel = door.group.children[0];
	assert.notStrictEqual(currentPanel, previousPanel);
	assert.ok(currentPanel.geometry.boundingBox);
	assert.ok(currentPanel.geometry.boundingSphere);
	assert.strictEqual(
		currentPanel.userData.AwtsmoosWorldModel.definition.id,
		door.definition().id
	);
	const hint = door.hint();
	evidence.camera.position.set(hint.x, hint.y, hint.z + 10);
	evidence.camera.target = [hint.x, hint.y, hint.z];
	const candidate = population.candidateFromPointer({ clientX: 400, clientY: 300 });
	assert.ok(candidate);
	assert.strictEqual(candidate.population, population);
	const mezuzah = population.houses[0].mezuzahs[0];
	population.activateCandidate({ subject: mezuzah, type: 'mezuzah' });
	assert.equal(evidence.events.at(-1).name, 'mezuzah:touched');
	assert.equal(
		evidence.events.at(-1).payload.houseId,
		population.houses[0].profile.id
	);
	assert.equal(population.diagnostics().houses, 2);
	assert.ok(population.diagnostics().doors > 0);
	assert.ok(population.diagnostics().mezuzahs > 0);
	population.destroy();
	assert.equal(evidence.activeColliders.size, 0);
	assert.equal(population.group.parent, null);
});

function createRuntimeEvidence() {
	const activeColliders = new Set();
	const events = [];
	const camera = new PerspectiveCamera(70, 4 / 3, 0.1, 2000);
	const runtime = {
		bus: { emit: (name, payload) => events.push({ name, payload }) },
		camera,
		hosts: {
			canvas: {
				getBoundingClientRect: () => ({
					height: 600,
					left: 0,
					top: 0,
					width: 800
				})
			}
		},
		mainOctree: {
			insert: (collider) => activeColliders.add(collider),
			remove: (collider) => activeColliders.delete(collider)
		},
		terrain: {
			heightAt: (x, z) => {
				return Math.sin(x * 0.025) * 2.4 + Math.cos(z * 0.021) * 1.8;
			}
		}
	};
	return { activeColliders, camera, events, runtime };
}

function assertHouseContract(root) {
	const meshes = [];
	forEachMesh(root, (mesh) => {
		meshes.push(mesh);
		assertMinimalMeadowHouseSurface(mesh);
		assert.ok(mesh.geometry.boundingBox);
		assert.ok(mesh.geometry.boundingSphere);
	});
	assert.ok(countMinimalMeadowCameraSafeWalls(meshes) > 0);
}

function forEachMesh(root, callback) {
	root.traverse((object) => {
		if (object.isMesh) callback(object);
	});
}
