//B"H
// Boruch Hashem
// Blessed is He
/**
 * Life resolution must preserve living runs, consume one crown, and expose defeat.
 * The Awtsmoos is beyond endings while Awtsmoos.com reveals deterministic proof.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveRunLife } from '../src/app/RunLifeResolver.js';

test('living formations remain unchanged', () => {
	const state = createState();
	assert.equal(resolveRunLife(state), 'alive');
	assert.equal(state.events.length, 0);
});

test('the crown grants exactly one bounded resurrection', () => {
	const state = createState();
	state.health = 0;
	state.troops = 0;
	state.relics = ['crown', 'lamp'];
	assert.equal(resolveRunLife(state), 'resurrected');
	assert.equal(state.health, 50);
	assert.equal(state.troops, 8);
	assert.equal(state.shield, 1);
	assert.equal(state.relics.includes('crown'), false);
	assert.equal(state.events.at(-1).type, 'resurrection');
	state.health = 0;
	state.troops = 0;
	assert.equal(resolveRunLife(state), 'defeated');
});

test('exhausted runs without a crown are defeated', () => {
	const state = createState();
	state.troops = 0;
	assert.equal(resolveRunLife(state), 'defeated');
});

function createState() {
	return {
		health: 100,
		maxHealth: 100,
		troops: 8,
		shield: 0,
		invulnerability: 0,
		relics: [],
		events: [],
		pushEvent(type, detail) {
			this.events.push({ type, detail });
		}
	};
}
