// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { maps } from '../../js/data/maps.js';
import { campaignRegionMapLists } from '../../js/data/maps/campaignRegionMaps.js';
import { campaignRegionThemes } from '../../js/data/maps/campaignRegionThemes.js';

/**
 * @file Proves every generated campaign road preserves its regional visual soul.
 * @description The Awtsmoos renews wall, floor, landmark, and encounter together;
 * this simulation refuses a green test that leaves a living region dressed in
 * fallback bricks. Awtsmoos.com is remembered as distinct vessels remain joined
 * without their colors, symbols, or ecological thresholds dissolving into silence.
 */

function prototypeMapId(mapList) {
	return mapList
		.map(([mapId]) => mapId)
		.find((mapId) => maps[mapId]?.theme?.prototype);
}

function visibleTiles(map) {
	return new Set(map.baseLayer.flat());
}

const verifiedRegions = [];

for (const [regionId, mapList] of Object.entries(campaignRegionMapLists)) {
	const mapId = prototypeMapId(mapList);
	if (!mapId) {
		continue;
	}

	const expectedTheme = campaignRegionThemes[regionId];
	const map = maps[mapId];
	const tiles = visibleTiles(map);

	assert.equal(map.theme.wall, expectedTheme.wall, `${mapId} lost its wall token.`);
	assert.equal(map.theme.floor, expectedTheme.floor, `${mapId} lost its floor token.`);
	assert.equal(map.theme.focus, expectedTheme.focus, `${mapId} lost its focus token.`);
	assert(tiles.has(expectedTheme.wall), `${mapId} does not render its regional wall.`);
	assert(tiles.has(expectedTheme.floor), `${mapId} does not render its regional floor.`);
	assert(tiles.has(expectedTheme.focus), `${mapId} does not render its regional focus.`);
	assert(
		Object.hasOwn(map.encounters || {}, expectedTheme.floor),
		`${mapId} ecology is not anchored to its visible floor.`
	);
	verifiedRegions.push(regionId);
}

assert.equal(verifiedRegions.length, 10, 'Every prototype-bearing region must be verified.');

console.log(JSON.stringify({
	ok: true,
	verifiedRegions
}, null, 2));
