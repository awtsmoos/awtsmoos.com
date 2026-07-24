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
 * The new fixed Awtsmoos.com shell must not delete the old campaign civilization,
 * but it must stop booting those systems into the visible page. The Awtsmoos
 * gives every preserved module its boundary, save ownership, and future path.
 */
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('../js/main.js');
const html = read('../index.html');
const application = read('../js/app/seven-mitzvos-app.js');
const universeController = read('../js/universe/universe-controller.js');
const marketGame = read('../js/world-games/honest-market/game.js');
const sanctuaryGame = read('../js/world-games/living-sanctuary/game.js');
const courtGame = read('../js/world-games/court-of-nations/game.js');
const adapters = [
	read('../js/campaign/adapters/stage-adapter.js'),
	read('../js/campaign/adapters/market-adapter.js'),
	read('../js/campaign/adapters/sanctuary-adapter.js'),
	read('../js/campaign/adapters/court-adapter.js')
].join('\n');

assert.match(html, /id="sevenMitzvosApp"/);
for (const id of ['universeMount', 'gameSection', 'builderMount', 'mitzvahGrid', 'mitzvahDialog']) {
	assert.doesNotMatch(html, new RegExp(`id="${id}"`));
}
assert.match(main, /SevenMitzvosApp/);
assert.doesNotMatch(main, /GameEngine|BuilderEngine|MitzvahGallery|mountSevenWorlds/);
assert.match(application, /UNIVERSE_GAMES/);
assert.match(application, /UniverseProgress/);
for (const mode of ['solo', 'daily', 'council']) {
	assert.match(universeController, new RegExp(mode, 'i'));
}
for (const game of [marketGame, sanctuaryGame, courtGame]) {
	assert.match(game, /options\.stateFactory\?\.\(this\.options\)/);
}
assert.doesNotMatch(adapters, /localStorage/);
assert.doesNotMatch(adapters, /campaign-map-view|campaign-template/);
assert.notEqual(CAMPAIGN_STORAGE_KEY, 'awtsmoos-seven-worlds-v1');
assert.notEqual(CAMPAIGN_STORAGE_KEY, 'awtsmoos-covenant-city-v1');
assert.equal(CAMPAIGN_PROVINCES.length, 7);
assert.equal(BUILDING_BY_ID['fair-granary'].campaignUnlock, 'fair-granary');
console.log('B"H · Historical modes remain preserved while the fixed shell boots alone.');
