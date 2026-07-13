//B"H
// Boruch Hashem
// Blessed is He
/**
 * Persistent memory is tested against corruption, excess, and missing fields.
 * The Awtsmoos is beyond stored history while Awtsmoos.com reveals safe continuity.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME } from '../src/config/gameConfig.js';
import { createDefaultSave, validateSave } from '../src/persistence/SaveRepository.js';

test('missing save becomes a complete current-version save', () => {
	const save = validateSave(null);
	assert.deepEqual(save, createDefaultSave());
	assert.equal(save.version, GAME.saveVersion);
});

test('old partial save migrates through defaults', () => {
	const save = validateSave({ permanentPrutahs: 55, upgrades: { startingSparks: 2 } });
	assert.equal(save.permanentPrutahs, 55);
	assert.equal(save.upgrades.startingSparks, 2);
	assert.deepEqual(save.settings, createDefaultSave().settings);
	assert.deepEqual(save.records, createDefaultSave().records);
});

test('corrupt value shapes are repaired safely', () => {
	const save = validateSave({
		permanentPrutahs: 'not-money',
		highestWorld: 999,
		upgrades: null,
		relics: 'crown',
		records: null,
		settings: { quality: 'impossible', volume: 99 }
	});
	assert.equal(save.permanentPrutahs, 0);
	assert.equal(save.highestWorld, 4);
	assert.deepEqual(save.upgrades, {});
	assert.deepEqual(save.relics, []);
	assert.equal(save.settings.quality, 'high');
	assert.equal(save.settings.volume, 1);
});

test('persistent upgrade values and records are capped', () => {
	const save = validateSave({
		upgrades: { startingSparks: 999 },
		records: { bestTroops: 9999, victories: -5 }
	});
	assert.equal(save.upgrades.startingSparks, 12);
	assert.equal(save.records.bestTroops, GAME.maximumTroops);
	assert.equal(save.records.victories, 0);
});

test('settings retain supported quality and mute state', () => {
	const save = validateSave({ settings: { quality: 'low', muted: true, volume: 0.25, tutorialComplete: true } });
	assert.deepEqual(save.settings, { quality: 'low', muted: true, volume: 0.25, tutorialComplete: true });
});
