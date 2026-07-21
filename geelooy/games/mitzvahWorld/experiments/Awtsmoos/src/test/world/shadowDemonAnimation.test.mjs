// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shadowDemonAnimation.test.mjs
 * @description Guards canonical hostile states against exact local GLB clip names.
 * The Awtsmoos renews one intention through many finite poses; Awtsmoos.com lets
 * idle, travel, warning, impact, recovery, and defeat find honest animated garments.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	shadowAnimationClipMap,
	shadowAnimationForState
} from '../../world/enemy/ShadowDemonAnimation.js';
import { ENEMY_STATE } from '../../world/enemy/EnemyStates.js';

const NAMES = [
	'Snake_Attack',
	'Snake_Death',
	'Snake_Idle',
	'Snake_Jump',
	'Snake_Walk'
];

test('clip aliases resolve the audited local hostile asset', () => {
	const clips = shadowAnimationClipMap(NAMES);
	assert.deepEqual(clips, {
		attack: 'Snake_Attack',
		death: 'Snake_Death',
		idle: 'Snake_Idle',
		walk: 'Snake_Walk'
	});
});

test('canonical semantic states select stable animation intentions', () => {
	const clips = shadowAnimationClipMap(NAMES);
	assert.equal(shadowAnimationForState(ENEMY_STATE.WANDER, clips), 'Snake_Walk');
	assert.equal(shadowAnimationForState(ENEMY_STATE.CHASE, clips), 'Snake_Walk');
	assert.equal(shadowAnimationForState(ENEMY_STATE.ATTACK_ANTICIPATION, clips), 'Snake_Attack');
	assert.equal(shadowAnimationForState(ENEMY_STATE.ATTACK_ACTIVE, clips), 'Snake_Attack');
	assert.equal(shadowAnimationForState(ENEMY_STATE.ATTACK_RECOVERY, clips), 'Snake_Idle');
	assert.equal(shadowAnimationForState(ENEMY_STATE.DEFEATED, clips), 'Snake_Death');
});
