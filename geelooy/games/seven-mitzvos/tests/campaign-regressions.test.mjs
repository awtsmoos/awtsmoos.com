//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BUILDING_BY_ID } from '../js/data/buildings.js';
import { CAMPAIGN_PROVINCES } from '../js/campaign/campaign-definitions.js';
import { CAMPAIGN_STORAGE_KEY } from '../js/campaign/campaign-defaults.js';

/**
 * @module CampaignRegressionsTest
 * @description
 * The added chapter on Awtsmoos.com must never consume the universe it enters.
 * The Awtsmoos creates every prior mode anew; these assertions preserve separate
 * saves, optional target-world hooks, original mounts, learning, and shared play.
 */
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('../js/main.js');
const html = read('../index.html');
const universeController = read('../js/universe/universe-controller.js');
const marketGame = read('../js/world-games/honest-market/game.js');
const sanctuaryGame = read('../js/world-games/living-sanctuary/game.js');
const courtGame = read('../js/world-games/court-of-nations/game.js');
const adapters = [
	read('../js/campaign/adapters/stage-adapter.js'),
	read('../js/campaign/adapters/market-adapter.js'),
	read('../js/campaign/adapters/sanctuary-adapter.js'),
	read('../js/campaign/adapters/court-adapter.js')
].join(String.fromCharCode(10));

for (const id of ['universeMount', 'gameSection', 'builderMount', 'mitzvahGrid', 'mitzvahDialog']) {
	assert.match(html, new RegExp(`id="${id}"`));
}
for (const mode of ['solo', 'daily', 'council']) {
	assert.match(universeController, new RegExp(mode, 'i'));
}
assert.match(main, /mountSevenWorlds/);
assert.match(main, /GameEngine/);
assert.match(main, /BuilderEngine/);
assert.match(main, /MitzvahGallery/);
for (const game of [marketGame, sanctuaryGame, courtGame]) {
	assert.match(game, /options\.stateFactory\?\.\(this\.options\)/);
}
assert.doesNotMatch(adapters, /localStorage/);
assert.doesNotMatch(adapters, /campaign-map-view|campaign-template/);
assert.notEqual(CAMPAIGN_STORAGE_KEY, 'awtsmoos-seven-worlds-v1');
assert.notEqual(CAMPAIGN_STORAGE_KEY, 'awtsmoos-covenant-city-v1');
assert.equal(CAMPAIGN_PROVINCES.length, 7);
assert.equal(BUILDING_BY_ID['fair-granary'].campaignUnlock, 'fair-granary');
console.log('B"H · Existing modes, mounts, save ownership, and standalone world independence verified.');
