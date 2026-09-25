// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialPlayerGlb.test.js
 * @description Proves the canonical Chossid gate rejects every fallback, empty mesh, and animation-less substitute.
 * The Awtsmoos gives the traveler one truthful garment; Awtsmoos.com refuses a counterfeit
 * while keeping the failure evidence exact enough to repair.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	getMitzvahWorldEssentialBootSnapshot,
} from './MitzvahWorldEssentialBoot.js';
import {
	isFallbackIdentity,
	loadEretzEssentialPlayerGlb,
	validateCanonicalPlayerGltf
} from './EretzEssentialPlayerGlb.js';

test('validateCanonicalPlayerGltf accepts an authored animated mesh', () => {
	const evidence = validateCanonicalPlayerGltf({ animations: [{ name: 'stand' }], scene: meshScene() });
	assert.equal(evidence.meshes, 1);
	assert.equal(evidence.animations, 1);
	assert.ok(evidence.source.includes('chossid.glb'));
	assert.ok(Object.isFrozen(evidence));
});

test('validateCanonicalPlayerGltf rejects a missing scene', () => {
	assert.throws(() => validateCanonicalPlayerGltf({ animations: [{}] }), /did not provide a scene/);
	assert.throws(() => validateCanonicalPlayerGltf(null), /did not provide a scene/);
});

test('validateCanonicalPlayerGltf rejects every known fallback identity', () => {
	const marks = [
		{ userData: { fallback: true } },
		{ scene: { userData: { fallback: true } } },
		{ scene: { userData: { modelAssetFallback: true } } },
		{ scene: { userData: { isolatedModelLoad: { fallback: true } } } }
	];
	for (const mark of marks) {
		const gltf = { animations: [{ name: 'stand' }], scene: meshScene(), ...mark };
		assert.ok(isFallbackIdentity(gltf), 'missed fallback mark ' + JSON.stringify(mark));
		assert.throws(() => validateCanonicalPlayerGltf(gltf), /forbidden fallback model/);
	}
});

test('validateCanonicalPlayerGltf rejects zero renderable meshes', () => {
	const empty = { userData: {}, traverse(visitor) { visitor({ isGroup: true }); } };
	assert.throws(() => validateCanonicalPlayerGltf({ animations: [{ name: 'stand' }], scene: empty }), /no renderable meshes/);
});

test('validateCanonicalPlayerGltf rejects zero authored animations', () => {
	assert.throws(() => validateCanonicalPlayerGltf({ animations: [], scene: meshScene() }), /no authored animations/);
});

test('isFallbackIdentity stays false for a clean authored scene', () => {
	assert.equal(isFallbackIdentity({ animations: [{}], scene: meshScene() }), false);
	assert.equal(isFallbackIdentity(null), false);
});

test('loadEretzEssentialPlayerGlb completes the canonical milestone with URL and stage', async () => {
	const environment = fakeEnvironment();
	completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED);
	const result = await loadEretzEssentialPlayerGlb({
		environment,
		playerLoader: async () => ({ animations: [{ name: 'stand' }], scene: meshScene() })
	});
	assert.ok(result.gltf.scene);
	assert.equal(result.evidence.meshes, 1);
	const milestone = getMitzvahWorldEssentialBootSnapshot(environment).milestones.canonicalChossidDecoded;
	assert.equal(milestone.status, 'complete');
	assert.equal(milestone.importerStage, 'canonical-validation');
	assert.ok(milestone.resourceUrl.includes('chossid.glb'));
});

test('loadEretzEssentialPlayerGlb fails the milestone with actionable evidence', async () => {
	const environment = fakeEnvironment();
	const failure = Object.assign(new Error('socket hangup'), { status: 503 });
	await assert.rejects(
		() => loadEretzEssentialPlayerGlb({ environment, playerLoader: async () => { throw failure; } }),
		/socket hangup/
	);
	const stalled = getMitzvahWorldEssentialBootSnapshot(environment).stalledMilestone;
	assert.equal(stalled.name, 'canonicalChossidDecoded');
	assert.equal(stalled.failureCode, 'CANONICAL_CHOSSID_GLB_LOAD_FAILED');
	assert.equal(stalled.failureMessage, 'socket hangup');
	assert.equal(stalled.resourceStatus, 503);
	assert.equal(stalled.importerStage, 'gltf-fetch-decode');
	assert.ok(stalled.resourceUrl.includes('chossid.glb'));
});

function meshScene() {
	return {
		userData: {},
		traverse(visitor) {
			visitor({ isMesh: true });
		}
	};
}

function fakeEnvironment() {
	let currentTime = 0;
	const state = {
		timeoutCallback: null,
		clearTimeout() {
			state.timeoutCallback = null;
		},
		performance: {
			now() {
				return currentTime;
			}
		},
		setTimeout(callback) {
			state.timeoutCallback = callback;
			return { unref() {} };
		},
	};
	return state;
}
