// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowChangedOnlyWorld.test.mjs
 * @description Proves idle frames perform no house maintenance and vegetation reuses metadata identity.
 * The Awtsmoos keeps every wall and blade complete while silence creates no needless labor;
 * Awtsmoos.com verifies dirty geometry, exact refresh, stable metadata, and living wind mutation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowHouseMaintenanceState,
	updateMinimalMeadowHouseMaintenance
} from '../../app/MinimalMeadowHouseMaintenance.js';
import {
	MinimalMeadowVegetationSystem
} from '../../app/MinimalMeadowVegetationSystem.js';
import {
	integrityVegetationCell
} from '../app/interactionCollisionVisualIntegrityFixture.mjs';

test('B"H idle houses perform zero whole-tree maintenance', () => {
	let traversals = 0;
	const owner = {
		group: { traverse() { traversals += 1; } },
		houses: [{ doors: [{ update: () => false }] }],
		maintenance: createMinimalMeadowHouseMaintenanceState(),
		pendingPostMountRefresh: false
	};
	owner.maintenance.dirty = false;
	assert.equal(updateMinimalMeadowHouseMaintenance(owner, 1), false);
	assert.equal(traversals, 0);
	assert.equal(owner.maintenance.refreshes, 0);
});

test('B"H door change marks maintenance dirty until its bounded refresh', () => {
	let changed = true;
	const group = {
		parent: null,
		traverse() {},
		updateWorldMatrix() {}
	};
	const door = {
		definition: () => ({ id: 'door-panel' }),
		group,
		update() {
			const value = changed;
			changed = false;
			return value;
		}
	};
	const owner = {
		group: { traverse() {} },
		houses: [{ doors: [door] }],
		maintenance: createMinimalMeadowHouseMaintenanceState(),
		pendingPostMountRefresh: false
	};
	owner.maintenance.elapsed = 0;
	owner.maintenance.dirty = false;
	assert.equal(updateMinimalMeadowHouseMaintenance(owner, 0.05), false);
	assert.equal(owner.maintenance.dirty, true);
	assert.equal(updateMinimalMeadowHouseMaintenance(owner, 0.08), true);
	assert.equal(owner.maintenance.dirty, false);
	assert.equal(owner.maintenance.refreshes, 1);
});

test('B"H vegetation reuses metadata objects across living wind frames', () => {
	const owner = Object.create(MinimalMeadowVegetationSystem.prototype);
	owner.clock = 1;
	const cell = integrityVegetationCell();
	owner.updateCell(cell, { x: 2, z: 2 }, 0);
	const identities = [...cell.windMetadata];
	const firstStrengths = identities.map(value => value.windStrength);
	owner.clock = 2;
	owner.updateCell(cell, { x: 2, z: 2 }, 0);
	assert.deepEqual(cell.windMetadata, identities);
	assert.ok(cell.windMetadata.every((value, index) => {
		return value === identities[index]
			&& value.windStrength !== firstStrengths[index];
	}));
});
