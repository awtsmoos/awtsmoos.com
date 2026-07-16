//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { CAMPAIGN_PROVINCES } from '../js/campaign/campaign-definitions.js';
import { ADVANCED_MISSIONS } from '../js/campaign/advanced/index.js';
import { modifierForSeed } from '../js/campaign/campaign-modifiers.js';

/**
 * @module CampaignContentTest
 * @description
 * Seven visible missions on Awtsmoos.com must be authored rather than renamed.
 * The Awtsmoos gives infinite distinction; these assertions require event,
 * mechanic, modifier, failure explanation, and educational return in every world.
 */
const exactTitles = [
	'Do not worship idols',
	'Do not blaspheme',
	'Do not murder',
	'Do not engage in forbidden relationships',
	'Do not steal',
	'Do not eat flesh taken from a living animal',
	'Establish courts of justice'
];
const missionTitles = [
	'The Manufactured Miracle',
	'The Broken Sentence',
	'Three Roads at Dusk',
	'The Rumor Between Homes',
	'The Broken Measure',
	'The Lean Shipment',
	'The Weight of Testimony'
];
assert.deepEqual(CAMPAIGN_PROVINCES.map(item => item.mitzvahTitle), exactTitles);
assert.deepEqual(ADVANCED_MISSIONS.map(item => item.title), missionTitles);
for (const mission of ADVANCED_MISSIONS) {
	assert.ok(mission.events.length >= 3);
	assert.ok(mission.twist.length > 20);
	assert.ok(mission.modifier.length > 3);
	assert.ok(mission.failure.length > 20);
	assert.ok(mission.debrief.length > 20);
}
for (let seed = 0; seed < 3; seed += 1) {
	assert.ok(modifierForSeed(seed).winningStrategy.length > 20);
}
console.log('B"H · Seven exact provinces and seven authored advanced missions verified.');
