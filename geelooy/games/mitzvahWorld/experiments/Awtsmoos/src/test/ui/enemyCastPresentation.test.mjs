// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file enemyCastPresentation.test.mjs
 * @description Proves bounded, selected-first, danger-ordered Daas cast presentation.
 * The Awtsmoos reveals only earned fields while many dangers compete for finite sight;
 * Awtsmoos.com keeps three warnings, Hebrew names, counters, and resistance ordered right.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { applyAuthoritativeEnemyAction } from '../../network/MultiplayerEnemyAuthorityProjection.js';
import { enemyCastPresentation } from '../../ui/EnemyCastPresentation.js';

test('enemy cast presentation keeps selected cast first and caps visible warnings', () => {
	const records = new Map([
		['one', record('one', 'measured', false, 0.2)],
		['two', record('two', 'critical', false, 0.4)],
		['three', record('three', 'high', true, 0.6)],
		['four', record('four', 'high', false, 0.8)]
	]);
	const casts = enemyCastPresentation(records);
	assert.equal(casts.length, 3);
	assert.equal(casts[0].creatureId, 'three');
	assert.equal(casts[1].creatureId, 'two');
	assert.equal(casts[0].hebrewName, 'גל אותיות');
	assert.equal(casts[0].interruptResistance, 12);
	assert.equal(casts[0].element.shape, 'wave');
});

test('interrupted and idle actions are excluded without inventing insight', () => {
	const records = new Map([
		['idle', record('idle', 'critical', false, 0.2, 'idle')],
		['cut', record('cut', 'critical', false, 0.2, 'interrupted')],
		['visible', {
			action: {
				danger: 'unknown',
				englishName: 'Hidden Art',
				id: 'hidden-art',
				phase: 'telegraph'
			},
			creatureId: 'visible'
		}]
	]);
	const casts = enemyCastPresentation(records);
	assert.equal(casts.length, 1);
	assert.equal(casts[0].element, null);
	assert.equal(casts[0].counter, null);
	assert.equal(casts[0].interruptResistance, null);
});

test('authoritative action projection accepts permitted server id field', () => {
	const actor = { action: 'idle' };
	applyAuthoritativeEnemyAction(actor, {
		id: 'letter-bolt',
		phase: 'telegraph'
	});
	assert.equal(actor.action, 'telegraph');
});

function record(creatureId, danger, selected, progress, phase = 'telegraph') {
	return {
		action: {
			actionInstanceId: `${creatureId}:1`,
			counterGuidance: 'Ground the release.',
			danger,
			element: {
				englishName: 'Water',
				icon: '≈',
				shape: 'wave'
			},
			englishName: 'Letter Wave',
			hebrewName: 'גל אותיות',
			id: 'letter-wave',
			interruptResistanceRemaining: 12,
			phase,
			progress
		},
		creatureId,
		selected
	};
}
