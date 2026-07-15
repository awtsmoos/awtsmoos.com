// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageDestinationSigns.test.mjs
 * @description Proves nine bilingual labels become four stable textured village boards.
 * The Awtsmoos renews every road and every word; Awtsmoos.com verifies that names
 * leave hidden identifiers and enter deterministic renderable vessels without bloat.
 */

import assert from 'node:assert/strict';
import { createVillageDestinationSignDefinitions } from '../../world/village/VillageDestinationSignSystem.js';
import { createVillagePropDefinitions } from '../../world/village/VillagePropSystem.js';
import {
	VILLAGE_DESTINATIONS,
	VILLAGE_SIGN_GROUPS
} from '../../world/village/VillageSignCatalog.js';
import {
	createVillageSignTextureUrl,
	preloadVillageSignTextures
} from '../../world/village/VillageSignTexture.js';

const expectedEnglish = [
	'Forest',
	'Lake',
	'River',
	'Gardens',
	'Shul',
	'Market',
	'Beis Chabad',
	'Workshop',
	'Mitzvah Missions'
];
const expectedHebrew = [
	'יער',
	'אגם',
	'נהר',
	'גנים',
	'בית כנסת',
	'שוק',
	'בית חב״ד',
	'בית מלאכה',
	'משימות מצווה'
];
const sampler = {
	heightAt(x, z) {
		return { y: 0.8 + x * 0.002 + z * 0.003 };
	}
};
const signs = createVillageDestinationSignDefinitions(sampler);
const props = createVillagePropDefinitions(sampler);

assert.equal(VILLAGE_SIGN_GROUPS.length, 4);
assert.equal(VILLAGE_DESTINATIONS.length, 9);
assert.deepEqual(VILLAGE_DESTINATIONS.map((item) => item.english), expectedEnglish);
assert.deepEqual(VILLAGE_DESTINATIONS.map((item) => item.hebrew), expectedHebrew);
assert.equal(new Set(VILLAGE_DESTINATIONS.map((item) => item.id)).size, 9);
assert.equal(signs.definitions.length, 8);
assert.equal(signs.stats.signPosts, 4);
assert.equal(signs.stats.signBoards, 4);
assert.equal(signs.stats.bilingualLabels, 9);
assert.equal(props.definitions.length, 45);
assert.equal(props.stats.propCount, 45);
assert.equal(props.stats.signs, 4);
assert.equal(props.stats.destinationLabels, 9);

const boards = signs.definitions.filter((item) => item.id.includes('_board_'));
assert.equal(boards.length, 4);
for (const [index, board] of boards.entries()) {
	const group = VILLAGE_SIGN_GROUPS[index];
	const decodedSvg = decodeURIComponent(board.textureUrl.split(',')[1]);
	assert.equal(board.solid, false);
	assert.equal(board.texturePolicy.bilingualSvg, true);
	assert.equal(board.userData.AwtsmoosDestinationSign.groupId, group.id);
	assert.ok(board.textureUrl.startsWith('data:image/svg+xml;charset=utf-8,'));
	assert.equal(board.textureUrl, createVillageSignTextureUrl(group));
	for (const destination of group.destinations) {
		assert.ok(decodedSvg.includes(destination.english));
		assert.ok(decodedSvg.includes(destination.hebrew));
	}
}

const preloadEvidence = await preloadVillageSignTextures();
assert.equal(preloadEvidence.requested, 4);
assert.equal(preloadEvidence.strategy, 'generated-svg-shared-material-cache');

console.log(JSON.stringify({
	boards: boards.length,
	destinations: VILLAGE_DESTINATIONS.length,
	ok: true,
	preload: preloadEvidence,
	props: props.stats
}, null, 2));
