// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combatAffinityAuthority.test.cjs
 * @description Verifies interruption, Daas privacy, migration, and strict live loadout authority.
 * The Awtsmoos renews hidden truth and revealed truth beneath a measured gate;
 * Awtsmoos.com proves cast cancellation and chosen affinity cannot be forged by state.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	enemyAction
} = require('./EnemyActionCatalog.js');
const {
	filterCombatInsight
} = require('./CombatInsightRules.js');
const {
	resolveEnemyInterrupt
} = require('./CombatInterruptRules.js');
const {
	beginEnemyAction,
	ensureEnemyActionState
} = require('./EnemyActionState.js');
const {
	restoreShliachState,
	setShliachLoadout
} = require('./ShliachProfileState.js');

test('interrupt resistance resets per cast and terminal interruption cancels resolution', () => {
	const creature = { id: 'shade-1', status: 'active' };
	const hostileAction = enemyAction('letter-bolt');
	beginEnemyAction(creature, hostileAction.id, hostileAction, 'player-1', 1000);
	const first = resolveEnemyInterrupt(
		creature,
		{ id: 'staff-light', interruptForce: 10 },
		1050,
		'player-1'
	);
	assert.equal(first.interrupted, false);
	assert.equal(first.remaining, 8);
	const second = resolveEnemyInterrupt(
		creature,
		{ id: 'staff-follow', interruptForce: 12 },
		1100,
		'player-1'
	);
	assert.equal(second.interrupted, true);
	const state = ensureEnemyActionState(creature);
	assert.equal(state.phase, 'interrupted');
	assert.equal(state.resolved, true);
	assert.equal(state.interruptResistanceRemaining, 0);
});

test('Daas tiers reveal only permitted hostile cast details', () => {
	const source = {
		counterGuidance: 'Break the channel.',
		danger: 'high',
		elementId: 'fire',
		englishName: 'Fire of Letters',
		hebrewName: 'אש האותיות',
		id: 'hebrew-fire',
		interruptResistance: 30,
		progress: 0.5,
		resistanceHint: { weakestElementId: 'water' },
		targetId: 'player-1'
	};
	const tierZero = filterCombatInsight(source, 0);
	assert.equal(tierZero.element, undefined);
	assert.equal(tierZero.progress, undefined);
	const tierTwo = filterCombatInsight(source, 2);
	assert.equal(tierTwo.element.id, 'fire');
	assert.equal(tierTwo.progress, 0.5);
	assert.equal(tierTwo.counterGuidance, 'Break the channel.');
	assert.equal(tierTwo.interruptResistance, undefined);
	const tierThree = filterCombatInsight(source, 3);
	assert.equal(tierThree.interruptResistance, 30);
	assert.deepEqual(tierThree.resistanceHint, { weakestElementId: 'water' });
});

test('old profiles migrate safely while live loadouts reject false affinity', () => {
	const restored = restoreShliachState({
		affinityLoadout: {
			actionIds: ['hebrew-fire', 'letter-light', 'hebrew-fire'],
			selectedAffinityId: 'binah'
		},
		attributes: { daas: 5 },
		unspentPoints: 2
	}, { mitzvahPoints: 9, xp: 70 });
	assert.equal(restored.schemaVersion, 2);
	assert.equal(restored.attributes.daas, 5);
	assert.equal(restored.attributes.malchus, 1);
	assert.equal(restored.attributes.zeirAnpin, 1);
	assert.deepEqual(restored.affinityLoadout.actionIds, ['hebrew-fire']);
	assert.equal(restored.mitzvahPoints, 9);
	assert.equal(restored.xp, 70);
	const player = { shliach: restored };
	assert.throws(
		() => setShliachLoadout(player, 'unknown', []),
		/AFFINITY_NOT_FOUND/
	);
	assert.throws(
		() => setShliachLoadout(player, 'binah', ['letter-light']),
		/ACTION_AFFINITY_MISMATCH/
	);
	assert.deepEqual(
		setShliachLoadout(player, 'binah', ['hebrew-fire', 'hebrew-fire']),
		{ actionIds: ['hebrew-fire'], selectedAffinityId: 'binah' }
	);
});
