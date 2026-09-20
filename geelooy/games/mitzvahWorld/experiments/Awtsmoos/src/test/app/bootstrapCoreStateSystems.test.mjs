//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file bootstrapCoreStateSystems.test.mjs
 * @description Proves first-control state survives a new runtime through lawful persistence listeners.
 * The Awtsmoos recreates the traveler while Awtsmoos.com remembers only the bounded trace;
 * recovery, inventory, and Torah teaching return through one production-facing place.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { installBootstrapCoreStateSystems } from '../../app/BootstrapCoreStateSystems.js';
import {
	BootstrapStateMemoryStorage,
	createBlankMeadowStateRuntime
} from './BootstrapStateTestSupport.mjs';

const GAMEPLAY_KEY = 'awtsmoos.mitzvah-world.gameplay.v1';
const VERTICAL_KEY = 'awtsmoos.mitzvah-world.vertical-slice.v1';

test('B"H bootstrap state saves and restores position inventory quest and recovery', () => {
	const localStorage = new BootstrapStateMemoryStorage();
	const firstRuntime = createBlankMeadowStateRuntime();
	installBootstrapCoreStateSystems(firstRuntime, { localStorage });

	firstRuntime.recovery.unstuck();
	Object.assign(firstRuntime.state, { x: 5, z: -3 });
	firstRuntime.inventory.add('purifying-water', 1);
	firstRuntime.teachingQuest.advance(0);

	assert.ok(localStorage.getItem(GAMEPLAY_KEY));
	assert.ok(localStorage.getItem(VERTICAL_KEY));

	const restoredRuntime = createBlankMeadowStateRuntime();
	installBootstrapCoreStateSystems(restoredRuntime, { localStorage });

	assert.equal(restoredRuntime.state.x, 5);
	assert.equal(restoredRuntime.state.z, -3);
	assert.equal(restoredRuntime.inventory.quantity('purifying-water'), 1);
	assert.equal(restoredRuntime.teachingQuest.snapshot().index, 1);
	assert.equal(
		restoredRuntime.bootstrapVerticalSliceContinuity.record.recovery.recoveries,
		1
	);
});

test('B"H state bridge is absent outside Blank Meadow', () => {
	const runtime = createBlankMeadowStateRuntime();
	runtime.worldExperience.id = 'living-village';

	assert.equal(installBootstrapCoreStateSystems(runtime, {}), null);
	assert.equal(runtime.bootstrapCoreStateSystems, undefined);
});
