//B"H
// Boruch Hashem
// Blessed is He
/**
 * Endless laws must escalate real pressure while remaining bounded and persistable.
 * The Awtsmoos is beyond quantity while Awtsmoos.com reveals deterministic proof.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { GAME } from '../src/config/gameConfig.js';
import {
	endlessValues,
	scaleEndlessReward
} from '../src/modes/EndlessRules.js';
import {
	runModes,
	validateRunMode
} from '../src/modes/RunModeCatalog.js';
import {
	appendRunHistory,
	validateRunHistory
} from '../src/persistence/RunHistory.js';
import { validateSave } from '../src/persistence/SaveValidation.js';

test('catalog exposes only implemented modes', () => {
	assert.deepEqual(runModes().map(mode => mode.id), ['campaign', 'endless']);
	assert.equal(validateRunMode('endless'), 'endless');
	assert.equal(validateRunMode('imaginary'), 'campaign');
});

test('endless pressure rises and remains capped', () => {
	const first = endlessValues(1);
	const deeper = endlessValues(20);
	const maximum = endlessValues(9999);
	assert.ok(deeper.speedMultiplier > first.speedMultiplier);
	assert.ok(deeper.enemyDepthBonus > first.enemyDepthBonus);
	assert.ok(deeper.bossHealthMultiplier > first.bossHealthMultiplier);
	assert.equal(maximum.speedMultiplier, 1.45);
	assert.equal(maximum.enemyDepthBonus, 40);
	assert.equal(maximum.rewardMultiplier, 2.8);
	assert.ok(maximum.encounterDelayMultiplier >= 0.58);
});

test('endless rewards scale from bounded state', () => {
	const state = { endlessRewardMultiplier: endlessValues(10).rewardMultiplier };
	assert.ok(scaleEndlessReward(state, 10) > 10);
	assert.equal(scaleEndlessReward(state, -5), 0);
});

test('legacy saves migrate into versioned mode records', () => {
	const migrated = validateSave({
		permanentPrutahs: 72,
		records: { victories: 3 }
	});
	assert.equal(migrated.version, GAME.saveVersion);
	assert.equal(migrated.permanentPrutahs, 72);
	assert.equal(migrated.records.victories, 3);
	assert.deepEqual(migrated.modeRecords.endless, {
		bestCycle: 0,
		bestDistance: 0,
		bestScore: 0
	});
	assert.deepEqual(migrated.runHistory, []);
});

test('run history is validated and capped at twenty', () => {
	let history = [];
	for (let index = 0; index < 25; index += 1) {
		history = appendRunHistory(history, {
			mode: 'endless',
			result: 'defeat',
			cycle: index + 1,
			score: index * 100
		});
	}
	assert.equal(history.length, 20);
	assert.equal(history[0].cycle, 25);
	assert.equal(validateRunHistory('broken').length, 0);
});
