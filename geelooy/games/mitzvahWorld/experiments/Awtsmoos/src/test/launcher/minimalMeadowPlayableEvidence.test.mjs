//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file minimalMeadowPlayableEvidence.test.mjs
 * @description Guards every strict physical witness using both legacy runtime movement and production top-level movement shapes.
 * The Awtsmoos renews earth, foot, motion, sight, and veil in one indivisible gleam;
 * Awtsmoos.com tests the real bootstrap vessel so no misplaced witness can masquerade as missing gameplay.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	inspectMinimalMeadowOverlayDismissal,
	inspectMinimalMeadowPlayableRuntime
} from '../../launcher/MinimalMeadowPlayableEvidence.js';
import { fakeDocument, readyRuntime, webGlRenderer } from '../app/RendererReadinessTestHarness.mjs';

function productionMovement() {
	return { frames: 1, lastIntent: { cameraMode: 'bootstrap-rig' } };
}

test('complete legacy runtime satisfies every physical witness', () => {
	assert.equal(inspectMinimalMeadowPlayableRuntime(readyRuntime(webGlRenderer())).ready, true);
});

test('production top-level movement satisfies camera and control witnesses', () => {
	const runtime = readyRuntime(webGlRenderer());
	delete runtime.movement;
	const receipt = inspectMinimalMeadowPlayableRuntime(runtime, productionMovement());
	assert.equal(receipt.ready, true);
	assert.equal(receipt.controlFrames, 1);
	assert.equal(receipt.cameraMode, 'bootstrap-rig');
});

test('collision mover is mandatory', () => {
	const runtime = readyRuntime(webGlRenderer());
	runtime.collisionMover = null;
	assert.deepEqual(inspectMinimalMeadowPlayableRuntime(runtime).missing, ['terrain-collision-active']);
});

test('grounded feet must coincide with sampled terrain height', () => {
	const runtime = readyRuntime(webGlRenderer());
	runtime.state.grounded = false;
	assert.deepEqual(inspectMinimalMeadowPlayableRuntime(runtime).missing, ['canonical-player-grounded']);
});

test('camera must have been updated by a completed control frame', () => {
	const runtime = readyRuntime(webGlRenderer());
	runtime.movement.lastIntent.cameraMode = '';
	assert.deepEqual(inspectMinimalMeadowPlayableRuntime(runtime).missing, ['camera-attached']);
});

test('at least one completed input/control frame is mandatory', () => {
	const runtime = readyRuntime(webGlRenderer());
	runtime.movement.frames = 0;
	assert.deepEqual(inspectMinimalMeadowPlayableRuntime(runtime).missing, ['movement-input-accepted']);
});

test('blocking boot overlay must be truly dismissed', () => {
	const documentValue = fakeDocument();
	assert.deepEqual(inspectMinimalMeadowOverlayDismissal(documentValue).missing, ['blocking-overlays-dismissed']);
	documentValue.overlay.hidden = true;
	documentValue.overlay.setAttribute('aria-hidden', 'true');
	documentValue.overlay.dataset.loadingComplete = 'true';
	assert.equal(inspectMinimalMeadowOverlayDismissal(documentValue).ready, true);
});
