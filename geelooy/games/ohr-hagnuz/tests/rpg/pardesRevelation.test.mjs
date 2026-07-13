// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file pardesRevelation.test.mjs
 * @description Guards the four learning paths, seven-road campaign, and HUD
 * fallbacks. The Awtsmoos is beyond enumeration, yet finite vessels must still
 * be counted honestly so a malformed path never masquerades as revelation.
 */
import assert from 'node:assert/strict';
import { PARDES_CHANNELS, PARDES_CHANNEL_BY_ID } from '../../src/data/learning/PardesChannels.js';
import { SEVEN_ROAD_CAMPAIGN, SEVEN_ROAD_SHLICHUS } from '../../src/data/stories/SevenRoadShlichus.js';
import { buildRevelationViewModel } from '../../src/tiferet/revelation/RevelationViewModel.js';

const uniqueValues = values => new Set(values).size === values.length;

assert.equal(PARDES_CHANNELS.length, 4, 'PaRDeS must expose exactly four elemental channels');
assert.ok(uniqueValues(PARDES_CHANNELS.map(channel => channel.id)), 'Channel ids must be unique');
assert.deepEqual(
	PARDES_CHANNELS.map(channel => channel.layer),
	['Pshat', 'Remez', 'Drush', 'Sod'],
	'Learning layers must follow the intended progression'
);

for (const channel of PARDES_CHANNELS) {
	assert.equal(PARDES_CHANNEL_BY_ID[channel.id], channel, `Channel index must retain ${channel.id}`);
	assert.ok(channel.learningPrinciple.length > 24, `${channel.id} needs a meaningful learning principle`);
	assert.ok(channel.openingMove.name, `${channel.id} needs an opening move`);
	assert.ok(channel.openingMove.effect, `${channel.id} needs a tactical effect`);
}

assert.equal(SEVEN_ROAD_SHLICHUS.length, 7, 'The opening shlichus must contain seven links');
assert.equal(SEVEN_ROAD_CAMPAIGN.links, SEVEN_ROAD_SHLICHUS, 'Campaign must expose the canonical chain');
assert.ok(uniqueValues(SEVEN_ROAD_SHLICHUS.map(link => link.id)), 'Road link ids must be unique');
assert.deepEqual(
	SEVEN_ROAD_SHLICHUS.map(link => link.order),
	[1, 2, 3, 4, 5, 6, 7],
	'Road links must remain ordered'
);

for (const link of SEVEN_ROAD_SHLICHUS) {
	assert.ok(link.objective.length > 20, `${link.id} needs a concrete objective`);
	assert.ok(link.teaching.length > 20, `${link.id} needs a substantial teaching`);
	assert.ok(link.reward.unlock, `${link.id} needs a visible unlock`);
}

const fallbackModel = buildRevelationViewModel({});
assert.equal(fallbackModel.level, 1, 'Missing state must fall back to level one');
assert.equal(fallbackModel.light, 100, 'Missing state must retain safe starting light');
assert.equal(fallbackModel.channels.length, 4, 'HUD must retain all four channels');
assert.equal(fallbackModel.routeLabel, '1 / 7', 'HUD must begin at the first road');

const progressedModel = buildRevelationViewModel({
	ActiveRealm: 'DEBATE',
	MapId: 'Cinder_Pass',
	Stats: { level: 8, light: 42, maxLight: 120, sparks: 10 },
	Campaign: { chapterIndex: 5 },
	Message: 'Reach the head messenger before the storm.'
});
assert.equal(progressedModel.realm, 'DEBATE');
assert.equal(progressedModel.location, 'Cinder Pass');
assert.equal(progressedModel.routeLabel, '6 / 7');
assert.equal(progressedModel.lightPercent, 35);
assert.ok(progressedModel.channels.every(channel => channel.unlocked), 'Late progression should reveal every channel');

console.log('BH_PARDES_REVELATION_PASS');
