// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCrowdActionSemantics.test.mjs
 * @description Proves social, devotional, locomotion, and combat movie actions resolve truthfully to imported clips.
 * The Awtsmoos renews intention before a finite animation can carry it;
 * Awtsmoos.com keeps semantic authoring expressive while every visible motion remains an actual available clip.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieActionCatalog } from '../../movie/MovieActionCatalog.js';
import {
	findMovieCrowdAnimation,
	movieActionSemanticCategory,
	movieCrowdActionNames
} from '../../movie/MovieCrowdActionSemantics.js';

const NAMES = [
	'Idle Neutral',
	'Walk Forward',
	'Jog Loop',
	'Hands Out Gesture',
	'Daven Standing',
	'Punch Right',
	'Stab Staff',
	'Celebration Dance'
];

test('semantic aliases resolve real imported clips and retain standing fallback', () => {
	assert.equal(findMovieCrowdAnimation(NAMES, 'walk'), 'Walk Forward');
	assert.equal(findMovieCrowdAnimation(NAMES, 'run'), 'Jog Loop');
	assert.equal(findMovieCrowdAnimation(NAMES, 'pray'), 'Hands Out Gesture');
	assert.equal(findMovieCrowdAnimation(NAMES, 'greet'), 'Hands Out Gesture');
	assert.equal(findMovieCrowdAnimation(NAMES, 'talk'), 'Hands Out Gesture');
	assert.equal(findMovieCrowdAnimation(NAMES, 'celebrate'), 'Hands Out Gesture');
	assert.equal(findMovieCrowdAnimation(NAMES, 'unknown-action'), 'Idle Neutral');
	assert.ok(movieCrowdActionNames().includes('point'));
	assert.ok(movieCrowdActionNames().includes('nod'));
});

test('semantic categories distinguish social, devotional, locomotion, and combat capabilities', () => {
	assert.equal(movieActionSemanticCategory('Daven Standing'), 'devotional');
	assert.equal(movieActionSemanticCategory('Friendly Wave'), 'social');
	assert.equal(movieActionSemanticCategory('Run Forward'), 'locomotion');
	assert.equal(movieActionSemanticCategory('Staff Attack'), 'combat');
});

test('action catalog exposes semantic categories while preserving runtime action types', () => {
	const runtime = {
		player: { names: NAMES },
		playerActionRegistry: {
			list: () => [
				{ id: 'castAttack', layer: 'upperBody', messageType: 'cast-attack' },
				{ id: 'friendly-wave', layer: 'upperBody', messageType: 'wave' }
			]
		}
	};
	const records = movieActionCatalog(runtime);
	assert.equal(records.find(record => record.id === 'Daven Standing').category, 'devotional');
	assert.equal(records.find(record => record.id === 'Walk Forward').category, 'locomotion');
	assert.equal(records.find(record => record.id === 'friendly-wave').category, 'social');
	assert.equal(records.find(record => record.id === 'castAttack').category, 'combat');
	assert.equal(records.find(record => record.id === 'castAttack').type, 'registered');
});
