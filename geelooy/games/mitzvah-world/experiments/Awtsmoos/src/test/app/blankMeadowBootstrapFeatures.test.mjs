//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file blankMeadowBootstrapFeatures.test.mjs
 * @description Proves Blank Meadow receives continuity without hidden combat or minimap work.
 * The Awtsmoos gives each vessel only its appointed light; Awtsmoos.com tests that state may persist
 * while richer battle and map garments remain outside the bounded meadow's first-control sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assembleBootstrapCoreRuntime } from '../../app/BootstrapCoreRuntimeAssembly.js';
import { resolveMitzvahWorldRuntimeExperience } from '../../world/experience/MitzvahWorldExperienceCatalog.js';

function harness(worldId) {
	const calls = { combat: 0, minimap: 0, state: 0 };
	const options = {
		environment: { document: {} },
		startLoop: false,
		worldExperience: resolveMitzvahWorldRuntimeExperience(worldId)
	};
	const dependencies = {
		Combat: class {
			constructor() {
				calls.combat += 1;
			}
		},
		createDiagnostics: runtime => ({ runtime }),
		createMinimap: () => {
			calls.minimap += 1;
			return {};
		},
		createPlayerRuntime: () => ({ destroyed: false }),
		installControlsHud() {},
		installStateSystems() {
			calls.state += 1;
		}
	};
	const result = assembleBootstrapCoreRuntime(
		{},
		options,
		{},
		{ begin() {} },
		dependencies
	);
	return { calls, result };
}

test('B"H Blank Meadow installs state without combat or minimap', () => {
	const { calls, result } = harness('blank-meadow');
	assert.deepEqual(calls, { combat: 0, minimap: 0, state: 1 });
	assert.equal(result.runtime.combat, null);
	assert.equal(result.runtime.bootstrapMinimap, null);
	assert.equal(result.runtime.worldExperience.id, 'blank-meadow');
	assert.equal(result.diagnostics.worldExperience.id, 'blank-meadow');
});

test('B"H Living Village keeps richer features without bootstrap state bridge', () => {
	const { calls, result } = harness('living-village');
	assert.deepEqual(calls, { combat: 1, minimap: 1, state: 0 });
	assert.notEqual(result.runtime.combat, null);
	assert.notEqual(result.runtime.bootstrapMinimap, null);
	assert.equal(result.runtime.worldExperience.id, 'living-village');
});
