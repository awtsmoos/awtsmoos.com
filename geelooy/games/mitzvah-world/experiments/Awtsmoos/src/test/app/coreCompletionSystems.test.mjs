// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file coreCompletionSystems.test.mjs
 * @description Proves safe recovery, unified missions, and three remembered map modes.
 * The Awtsmoos renews footing, purpose, and direction; Awtsmoos.com verifies recovery,
 * merged ownership, legacy preference, and full-screen persistence through bounded fixtures.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowMovementRecovery } from '../../app/MinimalMeadowMovementRecovery.js';
import { UnifiedQuestStore } from '../../gameplay/UnifiedQuestStore.js';
import {
	readWorldMinimapMode,
	writeWorldMinimapMode
} from '../../ui/WorldMinimapState.js';

test('B"H movement recovery restores the last safe checkpoint', () => {
	const events = [];
	const runtime = {
		bus: { emit: (type, payload) => events.push([type, payload]) },
		terrain: { heightAt: () => 5, size: 420 }
	};
	const state = {
		facing: 0,
		grounded: true,
		renderY: 5,
		travelFacing: 0,
		velY: 0,
		x: 2,
		y: 5,
		z: 3
	};
	const recovery = new MinimalMeadowMovementRecovery(runtime, state);
	recovery.checkpoint(state);
	Object.assign(state, { renderY: -50, velY: -20, y: -50 });
	assert.equal(recovery.beforeStep(state), true);
	assert.deepEqual([state.x, state.y, state.z, state.velY], [2, 5, 3, 0]);
	assert.equal(events[0][0], 'movement:recovered');
	Object.assign(state, { renderY: 5, x: Number.NaN, y: 5 });
	assert.equal(recovery.afterStep(state), true);
	assert.equal(recovery.diagnostics().recoveries, 2);
});

test('B"H dedicated and catalog missions share one projection', () => {
	const catalog = source({
		active: [record('catalog-active', 'active')],
		available: [record('catalog-open', 'available')],
		completed: [record('catalog-done', 'completed')],
		pinned: []
	});
	const dedicated = source({
		currentObjective: {
			count: 2,
			description: 'Disperse shadows.',
			progress: 1
		},
		definition: { id: 'dedicated', name: 'Dedicated Shlichus' },
		status: 'active'
	});
	const store = new UnifiedQuestStore({ catalog, dedicated });
	const snapshot = store.snapshot();
	assert.deepEqual(snapshot.active.map(value => value.definition.id), [
		'catalog-active',
		'dedicated'
	]);
	assert.equal(snapshot.available[0].definition.id, 'catalog-open');
	assert.equal(snapshot.completed[0].definition.id, 'catalog-done');
	assert.equal(snapshot.pinned[0].definition.id, 'dedicated');
	store.accept('dedicated');
	store.accept('catalog-open');
	assert.equal(dedicated.calls.dedicatedAccepts, 1);
	assert.deepEqual(catalog.calls.accept, ['catalog-open']);
	store.destroy();
});

test('B"H map state migrates expansion and remembers full-screen', () => {
	const values = new Map([
		['Awtsmoos.mitzvahWorld.minimap.expanded.v1', 'true']
	]);
	const storage = {
		getItem: key => values.get(key) || null,
		setItem: (key, value) => values.set(key, value)
	};
	assert.equal(readWorldMinimapMode(storage), 'expanded');
	assert.equal(writeWorldMinimapMode(storage, 'fullscreen'), 'fullscreen');
	assert.equal(readWorldMinimapMode(storage), 'fullscreen');
	assert.equal(writeWorldMinimapMode(storage, 'invented'), 'compact');
});

function record(id, status) {
	return { definition: { id, name: id }, pinned: false, status };
}

function source(snapshot) {
	const calls = { accept: [], dedicatedAccepts: 0 };
	return {
		calls,
		accept(id) {
			if (id) calls.accept.push(id);
			else calls.dedicatedAccepts += 1;
		},
		onChange() {
			return () => {};
		},
		snapshot: () => snapshot
	};
}
