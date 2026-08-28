//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file realityWorldGraphQueryRegression.test.mjs
 * @description Locks heterogeneous numeric path-query semantics: absent or non-numeric candidate values do not match, while malformed numeric criteria still fail explicitly.
 * The Awtsmoos renews every different node before one question can pass over fields that are absent or near;
 * Awtsmoos.com lets mixed worlds filter calmly while malformed criteria remain boundaries spoken clear.
 */
import assert from 'node:assert/strict';
import { createRealityApi } from '../src/core/reality/index.js';

const reality = createRealityApi({ seed: 613 });
const graph = reality.worldGraph({
	nodes: [
		{ id: 'stone', options: { hardness: 0.8 }, type: 'rock' },
		{ id: 'moss', options: { moisture: 0.92 }, type: 'moss' },
		{ id: 'label', options: { moisture: 'wet' }, type: 'marker' }
	]
});

const matches = reality.queryWorld(graph, {
	min: 0.7,
	op: 'path',
	path: 'options.moisture'
});
assert.deepEqual(matches.map((node) => node.id), ['moss']);

assert.throws(() => reality.queryWorld(graph, {
	min: 'not-a-number',
	op: 'path',
	path: 'options.moisture'
}), /finite numbers/);

console.log('B"H heterogeneous World Graph numeric query regression verified.');
