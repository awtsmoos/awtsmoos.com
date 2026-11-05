// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageBridgeContextAction.test.mjs
 * @description Proves Bridge Trial discovery requires a real Begin deed and generic providers share one resolver.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { DirectWorldContextAction } from '../../app/DirectWorldContextAction.js';
import { registerContextActionProvider } from '../../app/DirectWorldContextProviderRegistry.js';
import { VillageBridgeTrialQuestCoordinator } from '../../app/VillageBridgeTrialQuestCoordinator.js';
import { AdventureStore } from '../../gameplay/AdventureStore.js';
import { VILLAGE_BRIDGE_TRIAL_QUEST_ID } from '../../gameplay/VillageBridgeAdventures.js';
import { CANONICAL_VILLAGE_LANDMARKS } from '../../world/village/CanonicalVillagePlan.js';

function bus(events = []) {
	const listeners = new Map();
	return {
		emit(type, detail) {
			events.push({ detail, type });
			for (const listener of listeners.get(type) || []) listener(detail);
		},
		on(type, listener) {
			const set = listeners.get(type) || new Set();
			set.add(listener);
			listeners.set(type, set);
			return () => set.delete(listener);
		}
	};
}

test('approaching the trial offers it but does not accept until Begin is activated', () => {
	const events = [];
	const adventures = new AdventureStore();
	const entrance = CANONICAL_VILLAGE_LANDMARKS.entrance;
	const runtime = {
		bus: bus(events),
		catalogAdventures: adventures,
		model: { position: { x: entrance.x, z: entrance.z } }
	};
	const trial = new VillageBridgeTrialQuestCoordinator(runtime);
	trial.update();
	assert.equal(adventures.get(VILLAGE_BRIDGE_TRIAL_QUEST_ID).status, 'offered');
	assert.equal(trial.state().kind, 'begin');
	assert.equal(trial.shouldRunCourse(), false);
	trial.activate();
	assert.equal(adventures.get(VILLAGE_BRIDGE_TRIAL_QUEST_ID).status, 'active');
	assert.equal(trial.shouldRunCourse(), true);
	assert.equal(events.filter(event => event.type === 'quest:offer').length, 1);
	trial.destroy();
});

test('one direct resolver accepts arbitrary high-priority contextual action kinds', () => {
	const runtime = { bus: bus(), contextActionProviders: [], quest: null };
	let activations = 0;
	registerContextActionProvider(runtime, {
		priority: 80,
		state: () => ({ enabled: true, hint: 'Learn here.', kind: 'learn', label: 'Learn', visible: true }),
		activate: () => ++activations
	});
	const resolver = new DirectWorldContextAction(runtime);
	assert.equal(resolver.state().kind, 'learn');
	assert.equal(resolver.activate(), 1);
	assert.equal(activations, 1);
	resolver.destroy();
});
