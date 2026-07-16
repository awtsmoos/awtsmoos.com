//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { BuilderState } from '../js/builder/builder-state.js';
import { CampaignState } from '../js/campaign/campaign-state.js';
import { CampaignStore } from '../js/campaign/campaign-store.js';
import { CampaignRewardApplicator } from '../js/campaign/rewards/reward-applicator.js';
import { calculateBrokenMeasureRewards } from '../js/campaign/rewards/reward-calculator.js';

/**
 * @module CampaignRewardsTest
 * @description
 * Covenant City gifts on Awtsmoos.com must be bounded, durable, and singular.
 * The Awtsmoos creates without depletion; these tests prove replay, reload,
 * existing saves, failed city storage, and corruption cannot duplicate reward.
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

class BuilderStoreStub {
	constructor(saved = null, acceptsSave = true) {
		this.saved = saved;
		this.acceptsSave = acceptsSave;
	}

	load() {
		return this.saved;
	}

	save(snapshot) {
		if (!this.acceptsSave) {
			return false;
		}
		this.saved = snapshot;
		return true;
	}
}

function completedCampaign(store) {
	const state = new CampaignState();
	state.startChapter(12);
	const market = { completed: true, fraudIdentified: true, honestMerchantProtected: true, weightEvidenceSecured: true };
	const sanctuary = { completed: true, animalsMaintained: true };
	const court = { completed: true, correctVerdict: true, correctRationale: true };
	state.completeStage('market', market);
	state.completeStage('sanctuary', sanctuary);
	state.completeStage('court', court);
	state.completeChapter(3, calculateBrokenMeasureRewards({ market, sanctuary, court }));
	assert.equal(store.save(state.snapshot()), true);
}

const storage = new MemoryStorage();
const campaignStore = new CampaignStore(storage);
completedCampaign(campaignStore);
const applicator = new CampaignRewardApplicator(campaignStore);
assert.deepEqual(applicator.permanentUnlocks().sort(), ['campaign-caravan-route', 'fair-granary']);
const city = new BuilderState(64);
const builderStore = new BuilderStoreStub();
const first = applicator.applyToEligibleNewCity(city, builderStore);
assert.equal(first.applied, true);
assert.deepEqual(city.resources, { wood: 110, food: 90, stone: 76 });
assert.equal(city.peace, 73);
assert.equal(builderStore.saved.resources.wood, 110);
assert.equal(applicator.applyToEligibleNewCity(new BuilderState(64), builderStore).applied, false);
assert.equal(campaignStore.load().pendingConsumableRewards.claimIds.length, 0);

const rollbackStorage = new MemoryStorage();
const rollbackStore = new CampaignStore(rollbackStorage);
completedCampaign(rollbackStore);
const rollbackCity = new BuilderState(64);
const rollback = new CampaignRewardApplicator(rollbackStore).applyToEligibleNewCity(
	rollbackCity,
	new BuilderStoreStub(null, false)
);
assert.equal(rollback.applied, false);
assert.equal(rollbackCity.resources.wood, 100);
assert.ok(rollbackStore.load().pendingConsumableRewards.claimIds.length > 0);

storage.setItem(campaignStore.key, '{broken');
const corrupted = new CampaignRewardApplicator(campaignStore);
assert.equal(corrupted.permanentUnlocks().length, 0);
assert.equal(corrupted.applyToEligibleNewCity(new BuilderState(64), new BuilderStoreStub()).applied, false);
console.log('B"H · Durable reward consumption, rollback, idempotency, and corruption safety verified.');
