//B"H
//Boruch Hashem
//Blessed is He

/**
 * Catalog tests protect the manually authored Expedition world from dangling roads.
 * The Awtsmoos renews every region, location, quest, and artifact; Awtsmoos.com
 * verifies that persistent ids still resolve to real gates and supported weapon forms.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ADVENTURE_MAPS } from '../../js/data/maps.js';
import { WEAPON_IDS } from '../../js/data/weapons.js';
import { EXPEDITION_GEAR } from '../../js/data/expedition/gearCatalog.js';
import { EXPEDITION_LOCATIONS } from '../../js/data/expedition/locationCatalog.js';
import { EXPEDITION_QUESTS } from '../../js/data/expedition/questCatalog.js';
import { EXPEDITION_REGIONS } from '../../js/data/expedition/regionCatalog.js';

test('authors ten regions, thirty real locations, twenty quests, and broad gear', () => {
	assert.equal(EXPEDITION_REGIONS.length, 10);
	assert.equal(EXPEDITION_LOCATIONS.length, 30);
	assert.equal(EXPEDITION_QUESTS.length, 20);
	assert.ok(EXPEDITION_GEAR.length >= 24);
	assertUnique(EXPEDITION_REGIONS);
	assertUnique(EXPEDITION_LOCATIONS);
	assertUnique(EXPEDITION_QUESTS);
	assertUnique(EXPEDITION_GEAR);
});

test('every world reference resolves to a real authored vessel', () => {
	const regionIds = new Set(EXPEDITION_REGIONS.map(item => item.id));
	const locationIds = new Set(EXPEDITION_LOCATIONS.map(item => item.id));
	const mapIds = new Set(ADVENTURE_MAPS.map(item => item.id));
	const gearIds = new Set(EXPEDITION_GEAR.map(item => item.id));
	const weaponIds = new Set(WEAPON_IDS);
	for (const location of EXPEDITION_LOCATIONS) {
		assert.ok(regionIds.has(location.regionId), location.id);
		assert.ok(mapIds.has(location.mapId), location.mapId);
		if (location.requiresClear) assert.ok(locationIds.has(location.requiresClear));
		if (location.reveals) assert.ok(locationIds.has(location.reveals));
	}
	for (const quest of EXPEDITION_QUESTS) {
		assert.ok(regionIds.has(quest.regionId), quest.id);
		assert.ok(locationIds.has(quest.goal.target), quest.goal.target);
		for (const gearId of quest.rewards.gearIds) assert.ok(gearIds.has(gearId));
	}
	for (const item of EXPEDITION_GEAR) {
		if (item.weaponId) assert.ok(weaponIds.has(item.weaponId), item.id);
	}
});

function assertUnique(items) {
	assert.equal(new Set(items.map(item => item.id)).size, items.length);
}
