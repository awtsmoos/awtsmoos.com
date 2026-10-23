// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzBridgeFeatureMount.test.mjs
 * @description Proves rightful public-world authority and the bridge's single gameplay clock.
 * The Awtsmoos sets a boundary around every gifted span;
 * we test the earned deed, not a shortcut designed by man.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mountEretzBridgeFeature } from '../../app/EretzBridgeFeatureMount.js';
import { startEretzBridgeFeature } from '../../app/EretzBridgeFeatureBoot.js';
import { updateEretzWorldServices } from '../../app/EretzWorldServiceFrame.js';

/** A tiny authoritative runtime with deterministic quest and frame receipts. */
function fixture() {
	const quests = new Map();
	const counts = { trial: 0, restoration: 0, course: 0, traveler: 0, hud: 0, destroy: 0, river: 0 };
	const runtime = {
		model: { position: { x: 0, y: 0, z: 0 } },
		scene: { add() {}, remove() {} },
		bus: { emit() {} },
		catalogAdventures: {
			get: id => quests.get(id) || null,
			registerQuest: quest => quests.set(quest.id, quest)
		},
		terrain: { village: { services: { riverDynamics: { advance: () => counts.river++ } } } }
	};
	let courseEnabled = false;
	const factories = {
		Trial: class {
			update() { counts.trial++; }
			shouldRunCourse() { return courseEnabled; }
			destroy() { counts.destroy++; }
		},
		Restoration: class {
			constructor() { this.built = false; }
			destroy() { counts.destroy++; }
		},
		Course: class {
			constructor() { counts.course++; }
			update() {}
		},
		Traveler: class {
			update() { counts.traveler++; }
			destroy() { counts.destroy++; }
		},
		Hud: class {
			update() { counts.hud++; }
			destroy() { counts.destroy++; }
		}
	};
	return { runtime, quests, counts, factories, enableCourse: () => { courseEnabled = true; } };
}

test('unrelated worlds cannot instantiate or register the bridge', () => {
	const { runtime, quests, factories } = fixture();
	const mount = mountEretzBridgeFeature(runtime, { id: 'blank-meadow' }, {}, factories);
	assert.equal(mount.status, 'disabled');
	assert.equal(quests.size, 0);
	assert.equal(runtime.bridgeGameplay, undefined);
});

test('Living Village mounts two real quests, updates once per frame and tears down once', () => {
	const { runtime, quests, counts, factories, enableCourse } = fixture();
	const bridge = mountEretzBridgeFeature(runtime, { id: 'living-village' }, {}, factories);
	assert.equal(bridge.status, 'ready');
	assert.equal(quests.size, 2);
	assert.equal(mountEretzBridgeFeature(runtime, { id: 'living-village' }, {}, factories), bridge);
	updateEretzWorldServices(runtime, 0.1);
	assert.equal(counts.trial, 1);
	assert.equal(counts.traveler, 1);
	assert.equal(counts.hud, 1);
	assert.equal(counts.river, 1);
	enableCourse();
	updateEretzWorldServices(runtime, 0.1);
	updateEretzWorldServices(runtime, 0.1);
	assert.equal(counts.course, 1);
	assert.equal(bridge.destroy(), true);
	assert.equal(bridge.destroy(), false);
	assert.equal(counts.destroy, 4);
	assert.equal(runtime.bridgeGameplay, null);
});

test('post-playable scheduler never delays launch or mounts the wrong world', async () => {
	const { runtime } = fixture();
	const diagnostics = {};
	let launches = 0;
	const dependencies = { mountBridge: () => { launches++; return { status: 'ready' }; } };
	const disabled = startEretzBridgeFeature(runtime, { id: 'blank-meadow' }, {}, diagnostics, dependencies);
	assert.equal(disabled.status, 'disabled');
	assert.equal(launches, 0);
	const scheduled = startEretzBridgeFeature(runtime, { id: 'living-village' }, {}, diagnostics, dependencies);
	assert.equal(scheduled.status, 'scheduled');
	assert.equal(launches, 0);
	assert.equal((await scheduled.promise).status, 'ready');
	assert.equal(diagnostics.bridgeFeatureStage, 'ready');
	assert.equal(launches, 1);
});
