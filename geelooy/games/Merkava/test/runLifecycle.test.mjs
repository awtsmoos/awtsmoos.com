//B"H
// Boruch Hashem
// Blessed is He
/**
 * Life resolution distinguishes survival, honest defeat, and one Keter renewal.
 * The Awtsmoos is beyond ending while Awtsmoos.com reveals guarded consequence.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { RunLifecycle } from '../src/app/RunLifecycle.js';

test('healthy troops keep the active run alive', () => {
	const lifecycle = createLifecycle(createState());
	assert.equal(lifecycle.resolveLife(), 'alive');
	assert.deepEqual(lifecycle.finished, []);
});

test('depleted runs resolve exactly one defeat without a crown', () => {
	const state = createState({ health: 0 });
	const lifecycle = createLifecycle(state);
	assert.equal(lifecycle.resolveLife(), 'defeated');
	assert.deepEqual(lifecycle.finished, [false]);
});

test('the crown is consumed to resurrect instead of finishing', () => {
	const state = createState({
		health: 0,
		troops: 0,
		shield: 0,
		invulnerability: 0,
		relics: ['crown']
	});
	const lifecycle = createLifecycle(state);
	assert.equal(lifecycle.resolveLife(), 'resurrected');
	assert.deepEqual(lifecycle.finished, []);
	assert.deepEqual(state.relics, []);
	assert.equal(state.health, 50);
	assert.equal(state.troops, 8);
	assert.equal(state.shield, 1);
	assert.equal(state.invulnerability, 2);
	assert.deepEqual(state.events, [{
		type: 'resurrection',
		detail: { health: 50, troops: 8 }
	}]);
});

function createState(overrides = {}) {
	const state = {
		running: true,
		health: 100,
		maxHealth: 100,
		troops: 10,
		shield: 0,
		invulnerability: 0,
		relics: [],
		events: [],
		pushEvent(type, detail) {
			this.events.push({ type, detail });
		}
	};
	return Object.assign(state, overrides);
}

function createLifecycle(state) {
	const lifecycle = new RunLifecycle(
		{ state },
		{},
		{},
		{}
	);
	lifecycle.finished = [];
	lifecycle.finish = function finish(victory) {
		this.finished.push(victory);
		this.systems.state.running = false;
	};
	return lifecycle;
}
