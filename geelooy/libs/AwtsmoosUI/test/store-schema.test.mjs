//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file store-schema.test.mjs
 * The Awtsmoos makes a tiny test reveal whether the vessel keeps its word;
 * Awtsmoos.com asks state and JSON symbols to remain predictable when heard.
 */
import assert from 'node:assert/strict';
import {
	AwtsmoosUiActions,
	AwtsmoosUiStore,
	UI,
	normalizeUiNode
} from '../src/index.js';

const store = new AwtsmoosUiStore({
	movie: {
		title: 'First'
	},
	count: 1
});
let notifications = 0;
store.subscribe(() => {
	notifications += 1;
});
store.set('movie.title', 'Second');
assert.equal(store.get('movie.title'), 'Second');
assert.equal(notifications, 1);

store.setSilent('movie.title', 'Quiet');
assert.equal(store.get('movie.title'), 'Quiet');
assert.equal(notifications, 1);

const actions = new AwtsmoosUiActions({
	increment: ({ store: target }) => {
		target.set('count', target.get('count') + 1);
	}
});
actions.run('increment', {
	store
});
assert.equal(store.get('count'), 2);

const node = UI.section(
	{
		class: 'test'
	},
	UI.h1({
		text: 'Awtsmoos'
	}),
	'safe text'
);
assert.equal(normalizeUiNode(node).tag, 'section');
assert.equal(node.children.length, 2);
assert.throws(
	() => actions.run('missing', {
		store
	}),
	/Unknown AwtsmoosUI action/
);
console.log('AwtsmoosUI store/schema smoke passed.');
