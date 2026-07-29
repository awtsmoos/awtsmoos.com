// B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const test = require('node:test');
const { createPlayer } = require('./PlayerEntity.js');
const {
	addMaterial,
	ensureExpansionState
} = require('./PlayerExpansionState.js');
const { WorldExpansionService } = require('./WorldExpansionService.js');

function player() {
	return createPlayer({ displayName: 'Builder', id: 'builder-one' });
}

test('equipment upgrades consume materials once and expose one passive source', () => {
	const subject = player();
	const service = new WorldExpansionService();
	subject.progression.level = 2;
	addMaterial(subject, 'cedar-wood', 3);
	addMaterial(subject, 'staff-splinter', 2);

	const first = service.upgradeEquipment(subject, 'staff-oak-binding');
	const second = service.upgradeEquipment(subject, 'staff-oak-binding');
	const state = ensureExpansionState(subject);

	assert.equal(first.duplicate, false);
	assert.equal(second.duplicate, true);
	assert.equal(state.materials['cedar-wood'], 0);
	assert.equal(state.materials['staff-splinter'], 0);
	assert.equal(
		subject.passiveStatSources.filter(source => source.id === first.sourceId).length,
		1
	);
});

test('repeatable bounty advances its proof baseline and cannot double grant', () => {
	const subject = player();
	const service = new WorldExpansionService();
	const state = ensureExpansionState(subject);
	state.activities['herb-gathering'] = { count: 3 };

	const first = service.claimBounty(subject, 'kedem-herbal-request');
	assert.equal(first.claims, 1);
	assert.equal(state.materials['letter-fragment'], 1);
	assert.throws(
		() => service.claimBounty(subject, 'kedem-herbal-request'),
		error => error.code === 'BOUNTY_PROOF_REQUIRED'
	);

	state.activities['herb-gathering'].count = 6;
	const second = service.claimBounty(subject, 'kedem-herbal-request');
	assert.equal(second.claims, 2);
	assert.equal(state.materials['letter-fragment'], 2);
	assert.equal(subject.progression.rewardIds.length, 2);
});
