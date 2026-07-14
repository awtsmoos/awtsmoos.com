//B"H
//Boruch Hashem
//Blessed is He

/**
 * Mission tests protect ordered spatial deeds, one-time claims, civic-only commerce,
 * and trainer requirements. The Awtsmoos renews promise and fulfillment together;
 * Awtsmoos.com must never reward an out-of-order menu click or sell combat equipment.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { OPEN_WORLD_MERCHANT_OFFERS } from '../../js/data/openworld/OpenWorldMerchantCatalog.js';
import { createBaseExpeditionProfile } from '../../js/expedition/ExpeditionDefaults.js';
import {
	activateOpenWorldMission,
	claimOpenWorldMission,
	recordOpenWorldMissionEvent
} from '../../js/openworld/OpenWorldMissionLedger.js';
import { purchaseOpenWorldProvision } from '../../js/openworld/OpenWorldMerchant.js';
import { trainOpenWorldTechnique } from '../../js/openworld/OpenWorldTrainer.js';

test('shlichus advances only through its ordered physical events', () => {
	let profile = fundedProfile();
	profile = activateOpenWorldMission(profile, 'bread-for-a-neighbor', 'malchus-citadel').profile;
	const ignored = recordOpenWorldMissionEvent(profile, event('purchaseProvision', 'meal'));
	assert.equal(ignored.profile.openWorld.missions['bread-for-a-neighbor'].stageIndex, 0);
	for (const deed of [
		event('enterInterior', 'market'),
		event('purchaseProvision', 'meal'),
		event('enterInterior', 'shlichus')
	]) {
		profile = recordOpenWorldMissionEvent(profile, deed).profile;
	}
	assert.equal(profile.openWorld.missions['bread-for-a-neighbor'].status, 'complete');
	const claimed = claimOpenWorldMission(profile, 'bread-for-a-neighbor', 'malchus');
	assert.equal(claimed.claimed, true);
	assert.equal(
		claimOpenWorldMission(claimed.profile, 'bread-for-a-neighbor', 'malchus').claimed,
		false
	);
});

test('market remains civic-only and validates before charging', () => {
	assert.ok(OPEN_WORLD_MERCHANT_OFFERS.every(offer => offer.kind === 'civic'));
	assert.equal(
		OPEN_WORLD_MERCHANT_OFFERS.some(offer =>
			/weapon|armor/i.test(`${offer.name} ${offer.description}`)
		),
		false
	);
	const empty = createBaseExpeditionProfile();
	const denied = purchaseOpenWorldProvision(empty, 'bread-bundle', 'malchus-citadel');
	assert.equal(denied.purchased, false);
	assert.equal(denied.profile.perutas, empty.perutas);
	const purchased = purchaseOpenWorldProvision(
		fundedProfile(),
		'bread-bundle',
		'malchus-citadel'
	);
	assert.equal(purchased.purchased, true);
	assert.equal(purchased.profile.openWorld.provisions.meal, 2);
});

test('trainer advances hands and feet through reputation and fee', () => {
	const profile = fundedProfile();
	const punch = trainOpenWorldTechnique(profile, 'punch', 'malchus', 'malchus-citadel');
	assert.equal(punch.trained, true);
	assert.equal(punch.profile.openWorld.techniques.punchRank, 2);
	assert.equal(punch.event.targetId, 'punch');
	const denied = trainOpenWorldTechnique(
		createBaseExpeditionProfile(),
		'kick',
		'malchus',
		'malchus-citadel'
	);
	assert.equal(denied.trained, false);
});

function fundedProfile() {
	const profile = createBaseExpeditionProfile();
	return {
		...profile,
		perutas: 500,
		reputation: { ...profile.reputation, malchus: 20 }
	};
}

function event(type, targetId) {
	return { type, targetId, locationId: 'malchus-citadel', count: 1 };
}
