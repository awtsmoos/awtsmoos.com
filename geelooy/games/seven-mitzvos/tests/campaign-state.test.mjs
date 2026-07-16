//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { CAMPAIGN_STORAGE_KEY, createCampaignData } from '../js/campaign/campaign-defaults.js';
import { CampaignStore } from '../js/campaign/campaign-store.js';
import { CampaignState } from '../js/campaign/campaign-state.js';
import { modifierForSeed, orderedForSeed } from '../js/campaign/campaign-modifiers.js';
import { calculateChapterStars } from '../js/campaign/campaign-stars.js';

/**
 * @module CampaignStateTest
 * @description
 * The chapter memory on Awtsmoos.com must resume safely, reject corruption, and
 * never confuse activity with completion. The Awtsmoos needs no schema, yet the
 * game requires proof that every finite transition has one accountable order.
 */
class MemoryStorage {
	constructor() {
		this.values = new Map();
	}

	getItem(key) {
		return this.values.get(key) || null;
	}

	setItem(key, value) {
		this.values.set(key, value);
	}

	removeItem(key) {
		this.values.delete(key);
	}
}

const storage = new MemoryStorage();
const store = new CampaignStore(storage);
assert.equal(store.key, CAMPAIGN_STORAGE_KEY);
assert.equal(store.load().activeChapterId, null);

const state = new CampaignState(createCampaignData(), () => '2026-07-16T12:00:00.000Z');
state.startChapter(41);
assert.deepEqual(state.resume(), { chapterId: 'broken-measure', stageId: 'market' });
assert.equal(state.snapshot().modifierId, modifierForSeed(41).id);
assert.equal(state.completeStage('sanctuary', {}).ok, false);

const market = {
	completed: true,
	fraudIdentified: true,
	honestMerchantProtected: true,
	weightEvidenceSecured: true,
	remainingCoins: 44,
	marketReputation: 92
};
const sanctuary = {
	completed: true,
	animalsMaintained: true,
	habitatDelayed: true,
	sanctuaryWelfare: 84,
	publicTrustProtected: true,
	inventoryRecordCreated: true
};
const court = {
	completed: true,
	correctVerdict: true,
	correctRationale: true,
	falseAccusation: false
};
assert.equal(state.completeStage('market', market).nextStageId, 'sanctuary');
assert.equal(state.completeStage('sanctuary', sanctuary).nextStageId, 'court');
assert.equal(state.completeStage('court', court).nextStageId, null);
assert.equal(calculateChapterStars(state.snapshot().stageResults), 3);

const rewards = [
	{ id: 'monument', kind: 'permanent', unlock: 'fair-granary' },
	{ id: 'wood', kind: 'consumable', resource: 'wood', amount: 10 }
];
assert.equal(state.completeChapter(3, rewards).ok, true);
state.completeChapter(3, rewards);
assert.equal(state.snapshot().pendingConsumableRewards.wood, 10);
assert.deepEqual(state.snapshot().permanentUnlocks, ['fair-granary']);
assert.equal(state.consumePendingRewards().wood, 10);
assert.equal(state.consumePendingRewards().wood, 0);

state.restartChapter();
assert.equal(state.snapshot().modifierSeed, 41);
assert.equal(state.snapshot().permanentUnlocks.length, 1);
state.resetCampaign();
assert.equal(state.snapshot().activeChapterId, null);
assert.equal(state.snapshot().consumedRewardClaims.includes('wood'), true);

assert.deepEqual(
	orderedForSeed(['a', 'b', 'c'], 77),
	orderedForSeed(['a', 'b', 'c'], 77)
);
assert.equal(store.save(state.snapshot()), true);
assert.equal(store.load().consumedRewardClaims.includes('wood'), true);

storage.setItem(CAMPAIGN_STORAGE_KEY, '{broken');
const malformed = store.load();
assert.equal(malformed.rewardStateValid, false);
assert.equal(malformed.pendingConsumableRewards.wood, 0);

storage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify({ version: 999 }));
const unknown = store.load();
assert.equal(unknown.activeChapterId, null);
assert.equal(unknown.rewardStateValid, false);
console.log('B"H · Campaign lifecycle, determinism, validation, and reward identity verified.');
