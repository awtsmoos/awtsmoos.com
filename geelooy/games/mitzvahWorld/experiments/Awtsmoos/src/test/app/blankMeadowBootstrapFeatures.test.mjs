//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file blankMeadowBootstrapFeatures.test.mjs
 * @description Proves disabled Blank Meadow bootstrap systems are never constructed while richer worlds still opt in.
 * Constructor-count assertions protect the reliability baseline from accidental hidden work.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assembleBootstrapCoreRuntime } from '../../app/BootstrapCoreRuntimeAssembly.js';
import { resolveMitzvahWorldRuntimeExperience } from '../../world/experience/MitzvahWorldExperienceCatalog.js';

function harness(worldId) {
	const calls = { combat: 0, minimap: 0 };
	const options = {
		environment: { document: {} },
		startLoop: false,
		worldExperience: resolveMitzvahWorldRuntimeExperience(worldId)
	};
	const dependencies = {
		Combat: class {
			constructor() { calls.combat += 1; }
		},
		createDiagnostics: runtime => ({ runtime }),
		createMinimap: () => { calls.minimap += 1; return {}; },
		createPlayerRuntime: () => ({ destroyed: false }),
		installControlsHud() {}
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

test('B"H Blank Meadow never constructs bootstrap combat or minimap', () => {
	const { calls, result } = harness('blank-meadow');
	assert.deepEqual(calls, { combat: 0, minimap: 0 });
	assert.equal(result.runtime.combat, null);
	assert.equal(result.runtime.bootstrapMinimap, null);
	assert.equal(result.runtime.worldExperience.id, 'blank-meadow');
	assert.equal(result.diagnostics.worldExperience.id, 'blank-meadow');
});

test('B"H Living Village explicitly opts into combat and minimap', () => {
	const { calls, result } = harness('living-village');
	assert.deepEqual(calls, { combat: 1, minimap: 1 });
	assert.notEqual(result.runtime.combat, null);
	assert.notEqual(result.runtime.bootstrapMinimap, null);
	assert.equal(result.runtime.worldExperience.id, 'living-village');
});
