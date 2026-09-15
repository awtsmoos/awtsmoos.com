//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file minimalMeadowVisibleReadiness.test.mjs
 * @description Reproduces empty-shell states and proves none may dismiss the loading veil as playable.
 * The Awtsmoos asks Awtsmoos.com for visible truth, not merely allocated references: detached Chossid, hidden mesh,
 * missing terrain attachment, absent painted heartbeat, and frame failure each remain outside the playable covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectMinimalMeadowVisibleReadiness } from '../../launcher/MinimalMeadowVisibleReadiness.js';
import { readyRuntime, webGlRenderer } from './RendererReadinessTestHarness.mjs';

test('complete attached rendered runtime is visibly ready', () => {
	const receipt = inspectMinimalMeadowVisibleReadiness(readyRuntime(webGlRenderer()));
	assert.equal(receipt.ready, true);
	assert.equal(receipt.playerMeshes, 1);
	assert.equal(receipt.terrainMeshes, 1);
	assert.deepEqual(receipt.missing, []);
});

test('detached canonical Chossid reproduces empty shell and remains not ready', () => {
	const runtime = readyRuntime(webGlRenderer());
	runtime.model.parent = null;
	const receipt = inspectMinimalMeadowVisibleReadiness(runtime);
	assert.equal(receipt.ready, false);
	assert.ok(receipt.missing.includes('canonical-player-visible'));
});

test('hidden authored player mesh remains loading', () => {
	const runtime = readyRuntime(webGlRenderer());
	runtime.model.children[0].visible = false;
	const receipt = inspectMinimalMeadowVisibleReadiness(runtime);
	assert.equal(receipt.ready, false);
	assert.ok(receipt.missing.includes('canonical-player-mesh'));
});

test('detached terrain remains loading', () => {
	const runtime = readyRuntime(webGlRenderer());
	runtime.terrain.group.parent = null;
	const receipt = inspectMinimalMeadowVisibleReadiness(runtime);
	assert.equal(receipt.ready, false);
	assert.ok(receipt.missing.includes('bootstrap-terrain-visible'));
});

test('allocated world without a successful gameplay frame remains loading', () => {
	const runtime = readyRuntime(webGlRenderer());
	runtime.bootstrapFrames = 0;
	runtime.lastFrameAt = null;
	const receipt = inspectMinimalMeadowVisibleReadiness(runtime);
	assert.equal(receipt.ready, false);
	assert.ok(receipt.missing.includes('painted-gameplay-frame'));
});

test('frame failure blocks playable publication', () => {
	const runtime = readyRuntime(webGlRenderer());
	runtime.lastFrameError = new Error('render exploded');
	const receipt = inspectMinimalMeadowVisibleReadiness(runtime);
	assert.equal(receipt.ready, false);
	assert.ok(receipt.missing.includes('frame-error'));
});
