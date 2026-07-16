//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { BrokenMeasureMarketState } from '../js/campaign/chapters/broken-measure/market-state.js';
import { BrokenMeasureSanctuaryState } from '../js/campaign/chapters/broken-measure/sanctuary-state.js';
import { BrokenMeasureCourtState } from '../js/campaign/chapters/broken-measure/court-state.js';
import { calculateBrokenMeasureRewards } from '../js/campaign/rewards/reward-calculator.js';

/**
 * @module BrokenMeasureBranchesTest
 * @description
 * The consequence chain on Awtsmoos.com is proven through perfect, mixed, and
 * false-accusation paths. The Awtsmoos knows the truth at once; tests force each
 * finite conclusion to arise from visible actions rather than author preference.
 */
function perfectMarket() {
	const state = new BrokenMeasureMarketState({ seed: 18, modifierId: 'scarcity' });
	const fraud = state.stalls.findIndex(stall => stall.id === 'false-grain');
	const honest = state.stalls.findIndex(stall => stall.id === 'honest-grain');
	assert.equal(state.inspect(fraud).ok, true);
	assert.equal(state.secure(fraud).ok, true);
	assert.equal(state.inspect(honest).ok, true);
	assert.equal(state.buy(honest).ok, true);
	state.nextDay();
	return state.resultDetails();
}

function perfectSanctuary(market) {
	const state = new BrokenMeasureSanctuaryState({ previous: { market } });
	assert.equal(state.chooseStrategy('fair-replacement').ok, true);
	for (let day = 0; day < 2; day += 1) {
		while (state.actions > 0 && state.resources.food > 0) {
			const weakest = [...state.animals].sort((left, right) => left.hunger - right.hunger)[0];
			state.care(weakest.id, 'feed');
		}
		state.advanceDay();
	}
	return state.resultDetails();
}

function decideCourt(previous, verdict, rationale, findings) {
	const state = new BrokenMeasureCourtState({ previous });
	for (let index = 0; index < 6; index += 1) state.inspect(index);
	for (const [id, value] of Object.entries(findings)) state.setFinding(id, value);
	state.submit(verdict, rationale);
	return state.resultDetails();
}

const market = perfectMarket();
assert.equal(market.fraudIdentified, true);
assert.equal(market.honestMerchantProtected, true);
assert.equal(market.weightEvidenceSecured, true);

const sanctuary = perfectSanctuary(market);
assert.equal(sanctuary.animalsMaintained, true);
assert.equal(sanctuary.weakestAnimal > 0, true);
assert.equal(sanctuary.inventoryRecordCreated, true);

const correctFindings = { admissible: true, custody: true, rumorReliable: false, measurableHarm: true };
const court = decideCourt({ market, sanctuary }, 'false-grain-liable', 0, correctFindings);
assert.equal(court.correctVerdict, true);
assert.equal(court.correctRationale, true);
assert.equal(calculateBrokenMeasureRewards({ market, sanctuary, court }).length, 6);

const weakCourt = decideCourt({ market, sanctuary }, 'false-grain-liable', 1, correctFindings);
assert.equal(weakCourt.correctVerdict, true);
assert.equal(weakCourt.correctRationale, false);

const falseCourt = decideCourt({ market, sanctuary }, 'honest-grain-liable', 3, correctFindings);
assert.equal(falseCourt.falseAccusation, true);

const poorMarket = new BrokenMeasureMarketState({ seed: 18, modifierId: 'scarcity' });
poorMarket.nextDay();
const poorFlags = poorMarket.resultDetails();
const linked = new BrokenMeasureSanctuaryState({ previous: { market: poorFlags } });
assert.equal(linked.strategies().find(item => item.id === 'fair-replacement').legal, false);
assert.equal(linked.strategies().find(item => item.id === 'emergency-buy').legal, true);
console.log('B"H · Broken Measure perfect, mixed, failure, and linked-option branches verified.');
