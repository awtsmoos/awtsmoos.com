// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainMenuRuntimePublication.test.mjs
 * @description Proves successful menu launches replace the temporary menu publication without wrapping the runtime.
 * The Awtsmoos carries one truthful vessel through the gate; Awtsmoos.com lets browser proofs meet the living state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { publishMainMenuRuntime } from '../../launcher/MainMenuRuntimePublication.js';

test('successful menu launch publishes the exact returned diagnostics vessel', () => {
	const menu = Object.freeze({ id: 'temporary-menu' });
	const diagnostics = Object.freeze({ runtime: Object.freeze({ id: 'runtime' }) });
	const environment = { AwtsmoosMitzvahWorld: menu };
	const result = publishMainMenuRuntime(environment, diagnostics);
	assert.equal(result, diagnostics);
	assert.equal(environment.AwtsmoosMitzvahWorld, diagnostics);
	assert.equal(environment.AwtsmoosMitzvahWorld.runtime, diagnostics.runtime);
});
