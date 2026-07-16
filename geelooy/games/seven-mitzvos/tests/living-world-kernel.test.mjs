//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldKernelTest
 * @description
 * The first living region on Awtsmoos.com is driven through trade, production, building, travel, court, treaty, replay, and duplicate-command protection.
 */
import assert from 'node:assert/strict';
import { createCommand } from '../js/core/contracts/envelopes.js';
import { ReplayEngine } from '../js/core/replay/replay-engine.js';
import { createLivingRegionWorld } from '../js/world/living-region-fixture.js';
import { LivingWorldKernel } from '../js/world/living-world-kernel.js';
import { reduceLivingWorld } from '../js/world/living-world-reducer.js';

const initial = createLivingRegionWorld('integration-seed');
const kernel = new LivingWorldKernel(initial);
let sequence = 0;
const command = (type, payload) => createCommand({
	commandId: `integration-${sequence += 1}`,
	type,
	actorId: 'player-governor',
	worldId: initial.id,
	payload
});

kernel.process(command('SET_PRESET', { presetId: 'guided' }));
kernel.process(command('BUY_RESOURCE', {
	settlementId: 'covenant-gate',
	resource: 'food',
	quantity: 2
}));
kernel.process(command('PRODUCE', {
	settlementId: 'covenant-gate',
	recipeId: 'bread',
	batches: 2
}));
kernel.process(command('CONSTRUCT', {
	settlementId: 'covenant-gate',
	buildingType: 'farm',
	parcelId: 'covenant-gate-parcel-1'
}));
const travel = kernel.process(command('TRAVEL', { destination: 'river-measure', cargo: 5 }));
assert.equal(travel.events.length, 2);
assert.equal(kernel.snapshot().activeSettlementId, 'river-measure');

const filed = kernel.process(command('FILE_CASE', {
	claimantId: 'person-01',
	respondentId: 'person-03',
	claim: 'A market measure was short.',
	evidence: [{ id: 'evidence-1', kind: 'measure', weight: 80 }]
}));
const caseId = filed.state.cases[0].id;
kernel.process(command('RULE_CASE', {
	caseId,
	ruling: {
		finding: 'The measure was inaccurate.',
		remedy: 'Restore the missing goods and recalibrate the scale.',
		evidenceIds: ['evidence-1']
	}
}));
kernel.process(command('CREATE_TREATY', {
	parties: ['covenant-gate', 'river-measure'],
	obligations: [{ type: 'aid', resource: 'medicine', quantity: 5 }],
	durationDays: 30
}));

const duplicateCommand = command('ADVANCE_TIME', { minutes: 60 });
const firstAdvance = kernel.process(duplicateCommand);
const duplicateAdvance = kernel.process(duplicateCommand);
assert.equal(firstAdvance.duplicate, false);
assert.equal(duplicateAdvance.duplicate, true);
assert.equal(kernel.snapshot().cases[0].status, 'resolved');
assert.equal(kernel.snapshot().treaties.length, 1);
assert.ok(kernel.snapshot().chronicle.length >= 8);

const replay = new ReplayEngine();
const replayed = replay.replay(initial, kernel.events(), reduceLivingWorld);
assert.deepEqual(replayed, kernel.snapshot());
console.log('B"H · Living-world kernel vertical slice and deterministic replay verified.');
