// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nativeTerrainReadinessHand.test.mjs
 * @description Proves source frequency, WebGL-gated essential readiness, real hand grip, and aiming.
 * The Awtsmoos gives pixel, promise, hand, and intention measured vessels;
 * Awtsmoos.com blocks play on missing essentials while optional garments remain detached from WebGL's settled levels.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { minimalMeadowNativeFrequency } from '../../app/MinimalMeadowTerrainNativeFrequency.js';
import { attachMinimalWeapon } from '../../app/MinimalMeadowWeaponAttachment.js';
import {
	aimMinimalMeadowWeapon,
	restoreMinimalMeadowWeaponAim
} from '../../app/MinimalMeadowWeaponAim.js';
import { awaitMinimalMeadowReadiness } from '../../launcher/MinimalMeadowReadiness.js';
import {
	diagnosticsWith,
	fakeDocument,
	loadingPresenter,
	readyFeatureReceipt,
	webGlRenderer
} from './RendererReadinessTestHarness.mjs';

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

test('B"H essential features gate WebGL play while optional hydration stays detached', async () => {
	const features = deferred();
	const optional = deferred();
	const documentValue = fakeDocument();
	const diagnostics = diagnosticsWith(webGlRenderer());
	diagnostics.featuresPromise = features.promise;
	diagnostics.runtime.optionalFeaturePromise = optional.promise;
	let settled = false;
	const readiness = awaitMinimalMeadowReadiness(
		diagnostics,
		loadingPresenter(),
		documentValue
	).then(receipt => {
		settled = true;
		return receipt;
	});
	await Promise.resolve();
	assert.equal(settled, false);
	features.resolve(readyFeatureReceipt(optional.promise));
	const receipt = await readiness;
	assert.equal(receipt.ready, true);
	assert.equal(receipt.optionalPending, true);
	assert.equal(documentValue.documentElement.dataset.awtsmoosRuntimeState, 'playable');
	assert.equal(documentValue.documentElement.dataset.awtsmoosRenderer, 'webgl');
	optional.resolve({ ready: true });
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
