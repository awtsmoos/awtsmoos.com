// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodMathPolicy.test.js
 * @description Colocated unit tests for the LOD math and policy layer:
 * visibility hysteresis, sphere distance, transition priority, spatial event
 * keys, LOD level selection, authored fade ranges, frame budgets, and the
 * semantic distance policy.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createInitialLodStats,
	desiredLodVisibility,
	finiteLodNumber,
	lodSphereDistance,
	lodTransitionPriority
} from './LodControllerMath.js';
import { lodControllerEventKey } from './LodControllerEvent.js';
import {
	lodSpatialKey,
	lodSpatialKeyChanged,
	lodSpatialKeyString,
	yawSector
} from './LodSpatialKey.js';
import { selectLodLevel, idealLevelIndex } from './LodHysteresis.js';
import {
	lodAuthoredOpacity,
	readLodAuthoredRange,
	resolveLodAuthoredRange
} from './LodAuthoredRange.js';
import {
	createLodFrameClock,
	elapsedLodMilliseconds,
	normalizeLodMilliseconds,
	shouldSuspendLodFrame
} from './LodFrameBudget.js';
import {
	evaluateLodVisibility,
	inferLodClass,
	lodClassPolicy,
	lodMaximumDistance,
	lodPolicyClasses,
	normalizeLodClass
} from './LodPolicy.js';

test('desiredLodVisibility applies asymmetric hysteresis', () => {
	const max = 100;
	// Currently visible: hides only past max * (1 + margin).
	assert.equal(desiredLodVisibility({ currentlyVisible: true, distance: 110, maximumDistance: max, hysteresis: 0.12 }), true);
	assert.equal(desiredLodVisibility({ currentlyVisible: true, distance: 115, maximumDistance: max, hysteresis: 0.12 }), false);
	// Currently hidden: shows only inside max * (1 - margin).
	assert.equal(desiredLodVisibility({ currentlyVisible: false, distance: 90, maximumDistance: max, hysteresis: 0.12 }), false);
	assert.equal(desiredLodVisibility({ currentlyVisible: false, distance: 85, maximumDistance: max, hysteresis: 0.12 }), true);
	// Always-visible and protected classes never hide.
	assert.equal(desiredLodVisibility({ currentlyVisible: false, alwaysVisible: true, distance: 1e9, maximumDistance: max }), true);
	assert.equal(desiredLodVisibility({ currentlyVisible: false, distance: 1e9, maximumDistance: Infinity }), true);
	// Margin is clamped to [0, 0.49].
	assert.equal(desiredLodVisibility({ currentlyVisible: true, distance: 200, maximumDistance: max, hysteresis: 99 }), false);
});

test('lodSphereDistance measures to the closest sphere point', () => {
	assert.equal(lodSphereDistance({ x: 10, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, 0), 10);
	assert.equal(lodSphereDistance({ x: 10, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, 3), 7);
	// Inside the sphere reads zero, never negative.
	assert.equal(lodSphereDistance({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, 5), 0);
	// Non-finite coordinates fall back to 0.
	assert.equal(lodSphereDistance(null, { x: 3, y: 4, z: 0 }, 0), 5);
	assert.equal(finiteLodNumber(Number.NaN, 7), 7);
});

test('lodTransitionPriority orders near-visible first', () => {
	assert.ok(lodTransitionPriority(true, 5) > lodTransitionPriority(true, 50), 'near first when visible');
	assert.ok(lodTransitionPriority(false, 500) > lodTransitionPriority(false, 50), 'far first when hiding');
	assert.deepEqual(createInitialLodStats(), {
		registered: 0, events: 0, evaluations: 0, transitions: 0, lastTier: null, lastEventKey: null
	});
});

test('spatial keys quantize position and yaw into stable cells', () => {
	const a = lodSpatialKey({ position: { x: 11.9, y: 0, z: -0.1 }, yaw: 0.1, cellSize: 12, sectorCount: 16 });
	const b = lodSpatialKey({ position: { x: 11.9, y: 0, z: -0.1 }, yaw: 0.1, cellSize: 12, sectorCount: 16 });
	assert.equal(lodSpatialKeyString(a), lodSpatialKeyString(b));
	assert.equal(lodSpatialKeyChanged(a, b), false);
	const moved = lodSpatialKey({ position: { x: 25, y: 0, z: 0 }, yaw: 0.1, cellSize: 12, sectorCount: 16 });
	assert.equal(lodSpatialKeyChanged(a, moved), true);
	assert.equal(lodSpatialKeyChanged(null, a), true);
	// Yaw wraps: 2π is sector 0 again, and sector indices stay in range.
	assert.equal(yawSector(Math.PI * 2, 16), yawSector(0, 16));
	assert.ok(yawSector(-0.5, 16) >= 0 && yawSector(-0.5, 16) < 16);
	assert.equal(yawSector(Number.NaN, 16), 0);
});

test('controller event key binds space, yaw, and quality', () => {
	const base = { position: { x: 5, y: 0, z: 5 }, yaw: 0.5, tierName: 'high', cellSize: 12, sectorCount: 16 };
	const same = lodControllerEventKey(base);
	assert.equal(lodControllerEventKey(base), same);
	assert.notEqual(lodControllerEventKey({ ...base, tierName: 'low' }), same);
	assert.notEqual(lodControllerEventKey({ ...base, position: { x: 100, y: 0, z: 100 } }), same);
	assert.notEqual(lodControllerEventKey({ ...base, yaw: Math.PI }), same);
});

test('selectLodLevel resists threshold trembling', () => {
	const levels = [{ maximumDistance: 20 }, { maximumDistance: 60 }, { maximumDistance: 200 }];
	assert.equal(selectLodLevel({ distance: 10, levels }), 0);
	assert.equal(selectLodLevel({ distance: 100, levels }), 2);
	// Inside the hysteresis band the current level sticks.
	assert.equal(selectLodLevel({ distance: 21, levels, currentIndex: 0, hysteresis: 0.12 }), 0);
	assert.equal(selectLodLevel({ distance: 25, levels, currentIndex: 0, hysteresis: 0.12 }), 1);
	assert.equal(selectLodLevel({ distance: 55, levels, currentIndex: 1, hysteresis: 0.12 }), 1);
	assert.equal(selectLodLevel({ distance: 59, levels, currentIndex: 1, hysteresis: 0.12 }), 1);
	assert.equal(selectLodLevel({ distance: 10, levels: [], currentIndex: 0 }), 0);
	assert.equal(idealLevelIndex(45, [{ maximumDistance: 20 }, { maximumDistance: 60 }]), 1);
	assert.equal(idealLevelIndex(999, [{ maximumDistance: 20 }]), 0);
});

test('authored ranges validate, scale with tier, and fade smoothly', () => {
	assert.equal(readLodAuthoredRange({}), null);
	assert.equal(readLodAuthoredRange({ AwtsmoosLod: { fadeStart: 20, cullDistance: 10 } }), null);
	assert.deepEqual(readLodAuthoredRange({ AwtsmoosLod: { fadeStart: 20, cullDistance: 60 } }), { fadeStart: 20, cullDistance: 60 });
	const resolved = resolveLodAuthoredRange({ fadeStart: 20, cullDistance: 60 }, 'grass', 'low');
	assert.ok(resolved.fadeStart <= 20 && resolved.cullDistance <= 60, 'lower tier pulls the horizon in');
	assert.equal(resolveLodAuthoredRange(null, 'grass', 'low'), null);
	assert.equal(lodAuthoredOpacity(10, { fadeStart: 20, cullDistance: 60 }), 1);
	assert.equal(lodAuthoredOpacity(70, { fadeStart: 20, cullDistance: 60 }), 0);
	assert.equal(lodAuthoredOpacity(40, { fadeStart: 20, cullDistance: 60 }), 0.5);
	assert.equal(lodAuthoredOpacity(10, null), 1);
});

test('frame budgets normalize clocks and suspension gates', () => {
	assert.equal(normalizeLodMilliseconds(Infinity), Infinity);
	assert.equal(normalizeLodMilliseconds(-5), 0);
	assert.equal(normalizeLodMilliseconds('nope', 12), 12);
	assert.equal(normalizeLodMilliseconds(8), 8);
	assert.equal(shouldSuspendLodFrame(40, 33), true);
	assert.equal(shouldSuspendLodFrame(20, 33), false);
	assert.equal(shouldSuspendLodFrame(Number.NaN, 33), false);
	assert.equal(shouldSuspendLodFrame(100, Infinity), false);
	const clock = createLodFrameClock({ performance: { now: () => 1000 } });
	assert.equal(elapsedLodMilliseconds(clock, 990), 10);
	assert.equal(elapsedLodMilliseconds(() => 5, 10), 0, 'no negative drift');
});

test('policy classes normalize, infer, and bound distance', () => {
	assert.equal(normalizeLodClass('architecture'), 'building');
	assert.equal(normalizeLodClass('creature'), 'actor');
	assert.equal(normalizeLodClass('mountain'), 'terrain');
	assert.equal(normalizeLodClass('nope'), 'other');
	assert.ok(lodPolicyClasses().includes('grass'));
	assert.equal(inferLodClass('visible_player', {}), 'actor');
	assert.equal(inferLodClass('old_oak_tree', {}), 'vegetation');
	assert.equal(inferLodClass('garden_tuft_3', {}), 'grass');
	assert.equal(inferLodClass('cottage_roof', {}), 'building');
	assert.equal(inferLodClass('market_sign', {}), 'landmark');
	assert.equal(inferLodClass('mystery_box', {}), 'other');
	assert.equal(inferLodClass('x', { AwtsmoosLod: { className: 'creature' } }), 'actor');
	assert.equal(inferLodClass('x', { AwtsmoosYardGrass: true }), 'grass');
	assert.equal(lodMaximumDistance('actor', 'high'), Infinity);
	assert.equal(lodMaximumDistance('sky', 'low'), Infinity);
	const grassHigh = lodMaximumDistance('grass', 'high');
	const grassLow = lodMaximumDistance('grass', 'low');
	assert.ok(grassLow <= grassHigh, 'lower tier draws the grass horizon in');
	const judged = evaluateLodVisibility({ className: 'grass', distance: 40, tierName: 'high' });
	assert.equal(judged.visible, true);
	assert.equal(judged.reason, 'within-distance');
	const hidden = evaluateLodVisibility({ className: 'grass', distance: 400, tierName: 'high' });
	assert.equal(hidden.visible, false);
	assert.equal(hidden.reason, 'beyond-distance');
	const protectedActor = evaluateLodVisibility({ className: 'actor', distance: 1e9, tierName: 'high' });
	assert.equal(protectedActor.visible, true);
	assert.equal(protectedActor.reason, 'protected');
	const badGeometry = evaluateLodVisibility({ className: 'grass', distance: 5, geometryValid: false });
	assert.equal(badGeometry.visible, true);
	assert.equal(badGeometry.reason, 'invalid-geometry-protected');
	assert.ok(lodClassPolicy('grass').maximumDistance > 0);
});
