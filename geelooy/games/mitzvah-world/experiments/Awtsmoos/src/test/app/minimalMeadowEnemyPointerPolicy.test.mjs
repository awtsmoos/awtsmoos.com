// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowEnemyPointerPolicy.test.mjs
 * @description Proves fallen enemies own a wider multi-sample body footprint than living targets.
 * The Awtsmoos lets one deliberate touch find the whole fallen vessel; Awtsmoos.com keeps living
 * battle precise while corpse study and loot accept the shoulder, torso, ground, and side footprint.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	minimalMeadowEnemyPointerEvidence,
	minimalMeadowEnemyPointerHit
} from '../../app/MinimalMeadowEnemyPointerPolicy.js';

const canvas = {
	getBoundingClientRect() {
		return { height: 200, left: 0, top: 0, width: 200 };
	}
};
const camera = {
	aspect: 1,
	fov: 45,
	position: { x: 0, y: 2, z: 5 },
	target: { x: 0, y: 0.5, z: 0 }
};

function actor(alive) {
	return {
		alive,
		camera,
		canvas,
		group: { position: { x: 0, y: 0.42, z: 0 } },
		looted: false,
		targetHints() {
			return [{ x: 0, y: 0.7, z: 0 }];
		}
	};
}

test('B"H corpse pointer contract is wider and samples the fallen body', () => {
	const evidence = minimalMeadowEnemyPointerEvidence();
	assert.equal(evidence.livingRadius, 0.9);
	assert.equal(evidence.corpseRadius, 1.62);
	assert.equal(evidence.corpseSampleCount, 5);
	assert.ok(evidence.corpseRadius > evidence.livingRadius);
});

test('B"H off-center body tap finds corpse while preserving living precision', () => {
	const event = { clientX: 120, clientY: 130 };
	const livingHit = minimalMeadowEnemyPointerHit(actor(true), event);
	const corpseHit = minimalMeadowEnemyPointerHit(actor(false), event);
	assert.equal(livingHit, false);
	assert.equal(corpseHit, true);
});

test('B"H looted corpse cannot be selected again', () => {
	const fallen = actor(false);
	fallen.looted = true;
	assert.equal(minimalMeadowEnemyPointerHit(fallen, { clientX: 100, clientY: 100 }), false);
});
