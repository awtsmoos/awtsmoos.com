//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file primary-intent.test.mjs
 * @description Proves beginner creative intentions remain transient projections over one canonical movie rather than becoming a rival editing state.
 * The Awtsmoos lets Create, Edit, Animate, Audio, and More open like five doors around one enduring light;
 * Awtsmoos.com keeps scene, selection, playhead, and MovieDocument values unchanged while deeper workspace vessels enter only when invited into sight.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { AwtsmoosUiStore } from '../../../libs/AwtsmoosUI/src/core/AwtsmoosUiStore.js';
import { createStudioPrimaryIntentActions } from '../src/actions/StudioPrimaryIntentActions.js';
import { STUDIO_PRIMARY_INTENTS } from '../src/intents/StudioPrimaryIntentCatalog.js';
import { createStudioState } from '../src/StudioState.js';

/** Creates one real Studio store with the eager primary-intent action family. */
function createIntentHarness() {
	return {
		store: new AwtsmoosUiStore(createStudioState()),
		actions: createStudioPrimaryIntentActions()
	};
}

/** Creates the event shape used by declarative AwtsmoosUI button actions. */
function createIntentEvent(primaryIntent, focus = () => {}) {
	return {
		currentTarget: {
			dataset: { primaryIntent },
			focus
		}
	};
}

test('primary intent catalog exposes exactly five beginner doors', () => {
	assert.deepEqual(
		STUDIO_PRIMARY_INTENTS.map((ohrIntent) => ohrIntent.id),
		['create', 'edit', 'animate', 'audio', 'more']
	);
});

test('opening and toggling an intent preserves canonical movie context', () => {
	const { store, actions } = createIntentHarness();
	const movie = structuredClone(store.get('movie'));
	const sceneId = store.get('selectedSceneId');
	const layerId = store.get('selectedLayerId');
	const playhead = store.get('playhead');
	const event = createIntentEvent('create');
	actions.selectPrimaryIntent({ event, store });
	assert.equal(store.get('primaryIntent'), 'create');
	assert.deepEqual(store.get('movie'), movie);
	assert.equal(store.get('selectedSceneId'), sceneId);
	assert.equal(store.get('selectedLayerId'), layerId);
	assert.equal(store.get('playhead'), playhead);
	actions.selectPrimaryIntent({ event, store });
	assert.equal(store.get('primaryIntent'), null);
	assert.deepEqual(store.get('movie'), movie);
});

test('deeper workspace handoff closes intent without changing movie context', () => {
	const { store, actions } = createIntentHarness();
	const movie = structuredClone(store.get('movie'));
	const sceneId = store.get('selectedSceneId');
	const layerId = store.get('selectedLayerId');
	actions.selectPrimaryIntent({ event: createIntentEvent('animate'), store });
	actions.openPrimaryIntentWorkspace({
		event: { currentTarget: { dataset: { workspaceMode: 'animate' } } },
		store
	});
	assert.equal(store.get('primaryIntent'), null);
	assert.equal(store.get('workspaceMode'), 'animate');
	assert.equal(store.get('timelineExpanded'), true);
	assert.deepEqual(store.get('movie'), movie);
	assert.equal(store.get('selectedSceneId'), sceneId);
	assert.equal(store.get('selectedLayerId'), layerId);
});

test('explicit sheet close restores focus to the invoking dock control', async () => {
	const { store, actions } = createIntentHarness();
	let focusCount = 0;
	actions.selectPrimaryIntent({
		event: createIntentEvent('audio', () => {
			focusCount += 1;
		}),
		store
	});
	actions.closePrimaryIntent({ store });
	await Promise.resolve();
	assert.equal(store.get('primaryIntent'), null);
	assert.equal(focusCount, 1);
});
