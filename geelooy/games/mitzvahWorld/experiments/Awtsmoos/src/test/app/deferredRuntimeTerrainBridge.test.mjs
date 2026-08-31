//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file deferredRuntimeTerrainBridge.test.mjs
 * @description Guards the shared post-play terrain bridge so visible bootstrap earth begins texture hydration before any richer canonical world may execute.
 * The Awtsmoos clothes the ground beneath the first living stride while distant abundance waits beyond the gate;
 * Awtsmoos.com keeps one shared bridge ahead of Mountain Village execution and lets Simple Meadow remain complete in its lighter state.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const PRIORITY_URL = new URL('../../app/EretzPostPlayablePriority.js', import.meta.url);
const BRIDGE_URL = new URL('../../app/EretzBootstrapTerrainBridge.js', import.meta.url);

/** Proves the coordinator starts visible-terrain hydration before it resolves or executes rich launchers. */
async function verifySharedBridgeStartsBeforeRichWork() {
	const source = await readFile(PRIORITY_URL, 'utf8');
	const bridge = source.indexOf('startEretzBootstrapTerrainBridge(');
	const richBoundary = source.indexOf('const loadLaunchers = dependencies.loadLaunchers');
	const richExecution = source.indexOf('const launchers = await loadLaunchers();');
	assert.ok(bridge >= 0, 'shared bootstrap terrain bridge disappeared');
	assert.ok(richBoundary >= 0, 'rich launcher resolution boundary disappeared');
	assert.ok(richExecution >= 0, 'rich launcher execution boundary disappeared');
	assert.ok(bridge < richBoundary, 'rich launcher resolution now outruns visible terrain hydration');
	assert.ok(bridge < richExecution, 'rich launcher execution now outruns visible terrain hydration');
}

/** Proves the focused bridge owns the visible terrain hydrator and nonfatal fallback receipt. */
async function verifyBridgeOwnsTerrainHydration() {
	const source = await readFile(BRIDGE_URL, 'utf8');
	assert.match(source, /foundation\?\.terrain\?\.startTextureHydration/);
	assert.match(source, /status: 'degraded'/);
	assert.match(source, /bootstrapTerrainHydrationPromise/);
}

test('post-play priority starts bootstrap terrain hydration before richer world execution', verifySharedBridgeStartsBeforeRichWork);
test('bootstrap terrain bridge owns the visible terrain hydrator and nonfatal fallback', verifyBridgeOwnsTerrainHydration);
