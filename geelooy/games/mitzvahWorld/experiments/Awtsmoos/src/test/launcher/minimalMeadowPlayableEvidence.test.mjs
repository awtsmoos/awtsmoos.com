//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file minimalMeadowPlayableEvidence.test.mjs
 * @description Guards every strict physical witness that separates a visible shell from a genuinely playable meadow.
 * The Awtsmoos renews earth, foot, motion, sight, and veil in one indivisible gleam;
 * Awtsmoos.com tests each finite witness alone so no absent vessel can masquerade as the completed dream.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	inspectMinimalMeadowOverlayDismissal,
	inspectMinimalMeadowPlayableRuntime
} from '../../launcher/MinimalMeadowPlayableEvidence.js';
import {
	fakeDocument,
	readyRuntime,
	webGlRenderer
} from '../app/RendererReadinessTestHarness.mjs';

test('complete runtime satisfies every physical witness', () => {
	const receipt = inspectMinimalMeadowPlayableRuntime(readyRuntime(webGlRenderer()));
	assert.equal(receipt.ready, true);
	assert.deepEqual(receipt.missing, []);
});

test('collision mover is mandatory for production playable truth', () => {
	const runtime = readyRuntime(webGlRenderer());
	runtime.collisionMover = null;
	assert.deepEqual(inspectMinimalMeadowPlayableRuntime(runtime).missing, [
		'terrain-collision-active'
	]);
});

test('grounded feet must coincide with sampled terrain height', () => {
	const runtime = readyRuntime(webGlRenderer());
	runtime.state.grounded = false;
	assert.deepEqual(inspectMinimalMeadowPlayableRuntime(runtime).missing, [
		'canonical-player-grounded'
	]);
});

test('camera must have been updated by a completed control frame', () => {
	const runtime = readyRuntime(webGlRenderer());
	runtime.movement.lastIntent.cameraMode = '';
	assert.deepEqual(inspectMinimalMeadowPlayableRuntime(runtime).missing, [
		'camera-attached'
	]);
});

test('at least one completed input/control frame is mandatory', () => {
	const runtime = readyRuntime(webGlRenderer());
	runtime.movement.frames = 0;
	assert.deepEqual(inspectMinimalMeadowPlayableRuntime(runtime).missing, [
		'movement-input-accepted'
	]);
});

test('blocking boot overlay must be truly dismissed', () => {
	const documentValue = fakeDocument();
	assert.deepEqual(inspectMinimalMeadowOverlayDismissal(documentValue).missing, [
		'blocking-overlays-dismissed'
	]);
	documentValue.overlay.hidden = true;
	documentValue.overlay.setAttribute('aria-hidden', 'true');
	documentValue.overlay.dataset.loadingComplete = 'true';
	assert.equal(inspectMinimalMeadowOverlayDismissal(documentValue).ready, true);
});
