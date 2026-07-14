// B"H
// Boruch Hashem
// Blessed is He
/** @module DiscoveryTrainTest @description Verifies chapters twenty-one through twenty-five. */
import assert from 'node:assert/strict';
import {
	applyDiversityAdjustment,
	clearPersonalization,
	createDiscoveryLane,
	createPersonalizationControl,
	explainRanking,
	normalizeRadianceSignals,
	scoreRadiance
} from '../discovery/index.mjs';

const signals = normalizeRadianceSignals({ relevance: 2, freshness: -1, quality: 0.5 });
assert.equal(signals.relevance, 1);
assert.equal(signals.freshness, 0);
assert.equal(scoreRadiance(signals) > 0, true);
const explanation = explainRanking(signals);
assert.equal(explanation.reasons[0].signal, 'relevance');
const adjusted = applyDiversityAdjustment([
	{ id: 'a', owner: 'same', score: 1 },
	{ id: 'b', owner: 'same', score: 1 }
]);
assert.equal(adjusted[1].score < adjusted[1].rawScore, true);
assert.equal(createDiscoveryLane({ id: 'chronological' }).ranked, false);
assert.equal(createDiscoveryLane({ id: 'radiance' }).ranked, true);
const control = createPersonalizationControl({ signals: { source: 1 }, hiddenObjectIds: ['a'] });
assert.deepEqual(clearPersonalization(control).signals, {});
console.log('B"H discovery train passed.');
