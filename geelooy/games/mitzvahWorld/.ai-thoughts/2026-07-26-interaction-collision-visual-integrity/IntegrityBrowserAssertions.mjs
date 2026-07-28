// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IntegrityBrowserAssertions.mjs
 * @description Enforces the reported interaction, collision, and visual integrity contracts.
 * The Awtsmoos does not confuse a diagnostic label with visible truth; Awtsmoos.com requires
 * working touch, cast, staff, stairs, masonry, roots, bark, terrain scale, and browser health.
 */

import assert from 'node:assert/strict';

export function assertIntegrityBrowserReceipt(value) {
	assert.equal(value.visuals.dataset.awtsmoosRendererStage, 'rich-ready');
	assert.equal(value.visuals.dataset.awtsmoosRuntimeError, '');
	assertWeapon(value.visuals.weapon);
	assertHouseSurfaces(value.visuals.houseSurfaces);
	assertVegetation(value.visuals.vegetation);
	assertBark(value.visuals.bark);
	assertTerrain(value.visuals.terrain);
	assertInteraction(value.interaction);
	assertStairs(value.stairs);
	assert.deepEqual(value.browserEvidence.consoleErrors, []);
	assert.deepEqual(value.browserEvidence.exceptions, []);
	assert.deepEqual(value.browserEvidence.httpErrors, []);
	assert.deepEqual(value.browserEvidence.requestFailures, []);
}

function assertWeapon(weapon) {
	assert.equal(weapon.anchor, 'Awtsmoos_visible_equipped_weapon_anchor');
	assert.equal(weapon.anchorOwner, true);
	assert.ok(weapon.anchorDistance < 3);
	assert.ok(weapon.meshCount > 0);
	assert.equal(weapon.meshesVisible, true);
	assert.equal(weapon.visible, true);
}

function assertHouseSurfaces(surfaces) {
	assert.ok(surfaces.length > 50);
	assert.ok(surfaces.every((surface) => {
		return surface.allDoubleSided
			&& surface.allNoBackfaceCull
			&& surface.frustumCulled === false;
	}));
}

function assertVegetation(cells) {
	assert.ok(cells.length > 0);
	assert.ok(cells.every((cell) => cell.childrenRooted));
	assert.ok(cells.every((cell) => {
		return JSON.stringify(cell.quaternion) === JSON.stringify([0, 0, 0, 1]);
	}));
}

function assertBark(records) {
	assert.ok(records.length > 0);
	assert.ok(records.every((record) => {
		return record.doubleSided === true
			&& record.backfaceCull === false
			&& record.depthWrite === true
			&& record.frustumCulled === false;
	}));
}

function assertTerrain(terrain) {
	assert.equal(terrain.layerCount, 6);
	assert.equal(terrain.policy.fullSourceCoverage, true);
	assert.ok(terrain.policy.minimumWorldCoverage >= 180);
	assert.ok(terrain.policy.texelsPerWorld <= 16);
	assert.equal(
		terrain.policy.repetitionPolicy,
		'broad-source-with-restrained-detail'
	);
}

function assertInteraction(interaction) {
	assert.equal(interaction.selectedIsActor, true);
	assert.equal(interaction.selectedId, 'tzel-chai');
	assert.deepEqual(interaction.methods, {
		clear: 'function',
		payload: 'function',
		target: 'function'
	});
	assert.equal(interaction.buttonClicked, true);
	assert.ok(interaction.buttonAction);
	assert.ok(interaction.cast);
	assert.equal(interaction.runtimeError, '');
}

function assertStairs(stairs) {
	assert.equal(stairs.found, true);
	assert.equal(stairs.definition.solid, true);
	assert.equal(stairs.definition.visible, false);
	assert.equal(stairs.definition.walkable, true);
	assert.ok(stairs.definition.size.x > 0);
	assert.ok(stairs.definition.size.y > 0);
	assert.ok(stairs.definition.size.z > 0);
	assert.equal(stairs.meshVisible, false);
	assert.ok(stairs.octreeItems > 0);
	assert.ok(stairs.hit);
	assert.ok(stairs.hit.normal.y > 0.2);
}
