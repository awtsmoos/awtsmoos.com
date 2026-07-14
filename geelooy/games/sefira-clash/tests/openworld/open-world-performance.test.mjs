//B"H
//Boruch Hashem
//Blessed is He

/**
 * Performance tests protect hard caps through a long fixed-step city soak. The Awtsmoos
 * renews abundance and boundary together; Awtsmoos.com permits visual richness only while
 * citizens, ambience, telemetry, and domain evidence remain finite and predictable.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { stepOpenWorldState } from '../../js/openworld/OpenWorldRuntime.js';
import { pushOpenWorldDomainEvent } from '../../js/openworld/OpenWorldState.js';
import {
	createFundedOpenWorldModel,
	installOpenWorldBrowserStubs
} from './open-world-test-fixture.mjs';

installOpenWorldBrowserStubs();

test('three-thousand fixed steps preserve every declared collection cap', () => {
	const state = createFundedOpenWorldModel().createOpenWorld();
	for (let index = 0; index < 3000; index += 1) {
		pushOpenWorldDomainEvent(state, { type: 'test', targetId: `event-${index}` });
		stepOpenWorldState(state, { bySlot: {} });
	}
	assert.ok(state.openWorld.activeCitizens.length <= 12);
	assert.ok(state.openWorld.nearbyCitizens.length <= 20);
	assert.ok(state.openWorld.ambientParticles.length <= 48);
	assert.ok(state.openWorld.performance.samples.length <= 180);
	assert.ok(state.openWorld.domainEvents.length <= 64);
	assert.equal(state.winner, '');
	assert.equal(state.winnerId, null);
});
