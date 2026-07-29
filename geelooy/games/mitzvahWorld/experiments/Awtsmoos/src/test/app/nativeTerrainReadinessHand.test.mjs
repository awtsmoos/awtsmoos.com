// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nativeTerrainReadinessHand.test.mjs
 * @description Proves exact source frequency, two-stage readiness, real hand grip, and cast aiming.
 * The Awtsmoos gives pixel, paint, promise, hand, and intention their measured vessels;
 * Awtsmoos.com prevents stretched earth, blocked first control, and nearby-but-unheld tools.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import {
	minimalMeadowNativeFrequency
} from '../../app/MinimalMeadowTerrainNativeFrequency.js';
import {
	attachMinimalWeapon
} from '../../app/MinimalMeadowWeaponAttachment.js';
import {
	aimMinimalMeadowWeapon,
	restoreMinimalMeadowWeaponAim
} from '../../app/MinimalMeadowWeaponAim.js';
import {
	awaitMinimalMeadowReadiness
} from '../../launcher/MinimalMeadowReadiness.js';

test('B"H exact terrain frequency derives from source pixels and world size', () => {
	const plan = minimalMeadowNativeFrequency(
		{ naturalHeight: 2048, naturalWidth: 2048 },
		220,
		72,
		true
	);
	assert.equal(plan.frequency[0], 72 / 2048);
	assert.equal(plan.repeat[0], 220 * 72 / 2048);
	assert.equal(plan.tileWorld[0], 2048 / 72);
	assert.equal(plan.targetPixelsPerWorld, 72);
});

test('B"H first paint is playable before rich renderer and features resolve', async () => {
	const rendererDeferred = deferred();
	const featureDeferred = deferred();
	const root = { dataset: {} };
	const progress = [];
	const diagnostics = {
		featuresPromise: featureDeferred.promise,
		runtime: runtimeFixture(rendererDeferred.promise)
	};
	await awaitMinimalMeadowReadiness(
		diagnostics,
		{ world: value => progress.push(value) },
		{ documentElement: root },
		{ requestAnimationFrame: callback => callback(), console }
	);
	assert.equal(root.dataset.awtsmoosReadiness, 'playable');
	assert.equal(progress.at(-1).progress, 1);
	assert.equal(diagnostics.readinessReceipt.state, 'playable');
	assert.equal(diagnostics.readinessReceipt.paintedFrames, 2);
	assert.equal(diagnostics.fullReadinessPromise instanceof Promise, true);
	rendererDeferred.resolve({ rich: true });
	featureDeferred.resolve({ ready: true });
	await diagnostics.fullReadinessPromise;
	assert.equal(root.dataset.awtsmoosReadiness, 'ready');
	assert.equal(diagnostics.readinessReceipt.features.ready, true);
});

test('B"H staff begins in right hand and aims at selected target', () => {
	const modelRoot = new Group();
	const rightHand = new Group();
	rightHand.name = 'RightHand';
	modelRoot.add(rightHand);
	const weapon = new Group();
	weapon.userData.weaponKind = 'staff';
	const targetGroup = new Group();
	targetGroup.position.set(8, 0, 6);
	const owner = {
		drawn: true,
		nodes: { modelRoot, rightHand },
		runtime: {
			enemies: { selected: { group: targetGroup, profile: { height: 2.4, id: 'target' } } },
			state: { facing: 0 }
		},
		weapon
	};
	assert.equal(attachMinimalWeapon(weapon, owner.nodes, true), true);
	assert.equal(weapon.parent.parent, rightHand);
	assert.equal(weapon.userData.handBound, true);
	assert.equal(aimMinimalMeadowWeapon(owner, { actionId: 'letter-light' }), true);
	assert.equal(weapon.parent.userData.AwtsmoosWeaponAim.targetId, 'target');
	restoreMinimalMeadowWeaponAim(owner);
	assert.equal(weapon.parent.userData.AwtsmoosWeaponAim, undefined);
});

function deferred() {
	let resolve;
	const promise = new Promise(value => resolve = value);
	return { promise, resolve };
}

function runtimeFixture(hydrationPromise) {
	return {
		bootstrapHud: { refresh() {} },
		camera: {},
		cameraRig: { update() {} },
		mainOctree: {},
		renderer: {
			hydrate: () => hydrationPromise,
			hydrationState: 'ready',
			render() {},
			setInteractor() {}
		},
		state: {},
		ui: { refresh() {} }
	};
}
