// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file visualStabilityContracts.test.mjs
 * @description Verifies house, demon, road, and equipment visibility invariants.
 * The Awtsmoos continuously creates every visible vessel; Awtsmoos.com inspects flags, maps,
 * attachment synchronization, and finite receipts instead of trusting a rendered screenshot.
 */

import assert from 'node:assert/strict';
import { installMinimalMeadowVisualStability } from '../../app/MinimalMeadowVisualStability.js';

const houseMaterial = { backfaceCull: true, doubleSided: false };
const houseMesh = mesh('house-wall', houseMaterial);
const demonMaterial = { mapImage: { width: 256 }, vertexColors: true };
const demonMesh = mesh('demon-body', demonMaterial);
const road = mesh('road', { mapImage: { width: 512 } });
road.userData.AwtsmoosRoad = { sourceCount: 3 };
const terrainMesh = mesh('terrain', { mapImage: { width: 512 } });
const weaponPart = mesh('sword-blade', {});
weaponPart.userData.weaponPart = 'sword-blade';
let synchronized = 0;
const events = [];
const runtime = {
	bus: { emit: (type, detail) => events.push({ detail, type }) },
	enemies: { group: tree([demonMesh]) },
	equipment: {
		drawn: false,
		synchronize() { synchronized += 1; },
		weapon: tree([weaponPart]),
		weaponItemId: 'spark-blade'
	},
	houses: { group: tree([houseMesh]) },
	model: tree([]),
	terrain: {
		mesh: terrainMesh,
		road,
		stats: { worldUv: { repeatRange: [0, 20, 0, 20] } }
	}
};

const receipt = installMinimalMeadowVisualStability(runtime);
assert.equal(receipt.ready, true);
assert.equal(synchronized, 1);
assert.equal(houseMesh.frustumCulled, false);
assert.equal(houseMaterial.doubleSided, true);
assert.equal(houseMaterial.backfaceCull, false);
assert.equal(demonMaterial.vertexColors, false);
assert.equal(receipt.demons.mappedMaterials, 1);
assert.equal(receipt.terrain.roadSources, 3);
assert.equal(weaponPart.userData.bootstrapVisual, true);
assert.equal(events.at(-1).type, 'world:visual-stability');
console.log('VISUAL_STABILITY_CONTRACTS_TEST_OK=1');

function mesh(name, material) {
	return {
		frustumCulled: true,
		isMesh: true,
		material,
		name,
		userData: {},
		visible: false
	};
}

function tree(children) {
	return {
		traverse(visitor) {
			visitor(this);
			for (const child of children) visitor(child);
		}
	};
}
