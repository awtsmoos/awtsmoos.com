//B"H
//Boruch Hashem
//Blessed is He

/**
 * Frontier map tests prove every atlas place compiles into explicit unique geometry.
 * The Awtsmoos renews city, forest, and climax together; Awtsmoos.com rejects reused
 * runtime structures, dangling locations, missing services, and empty guardian anchors.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { EXPEDITION_LOCATIONS } from '../../js/data/expedition/locationCatalog.js';
import { EXPEDITION_MAP_VARIANTS } from '../../js/data/expedition/mapVariantCatalog.js';
import { ADVENTURE_MAPS } from '../../js/data/maps.js';
import { compileExpeditionMaps } from '../../js/expedition/ExpeditionMapCompiler.js';

test('compiles thirty unique bespoke Expedition roads', () => {
	const maps = compileExpeditionMaps(ADVENTURE_MAPS);
	const geometries = maps.map(map =>
		JSON.stringify({
			platforms: map.platforms,
			walls: map.walls,
			spawns: map.spawns
		})
	);
	assert.equal(EXPEDITION_MAP_VARIANTS.length, 30);
	assert.equal(maps.length, 30);
	assert.equal(new Set(geometries).size, 30);
	assert.deepEqual(
		new Set(maps.map(map => map.expedition.locationId)),
		new Set(EXPEDITION_LOCATIONS.map(location => location.id))
	);
});

test('every settlement and climax owns the required authored nodes', () => {
	const maps = compileExpeditionMaps(ADVENTURE_MAPS);
	const settlements = maps.filter(map => map.expedition.locationKind === 'settlement');
	const climaxes = maps.filter(map => map.expedition.locationKind === 'climax');
	assert.equal(settlements.length, 10);
	assert.equal(climaxes.length, 10);
	for (const map of settlements) {
		assert.equal(map.expedition.serviceNodes.length, 2, map.name);
		assert.ok(map.platforms.length >= 7, map.name);
	}
	for (const map of climaxes) {
		assert.ok(map.expedition.bossNode, map.name);
		assert.ok(map.expedition.weatherTags.length >= 2, map.name);
	}
});
