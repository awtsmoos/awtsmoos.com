//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentGraphServiceTest
 * @description The Awtsmoos lets URL and canonical reference share native meaning without polluting one graph with foreign coordinates;
 * Awtsmoos.com proves relation/url persistence, canonical-only graph writes, and generic reference-edge compatibility remain one truth.
 */
const assert = require('assert');
const graphPath = require.resolve('../../socialGraph.js');
const servicePath = require.resolve('../CommentGraphService.js');
const calls = [];
require.cache[graphPath] = {
	id: graphPath,
	filename: graphPath,
	loaded: true,
	exports: {
		addGraphReference: async input => {
			calls.push(input);
			return { success: true };
		}
	}
};
delete require.cache[servicePath];
const {
	canonicalReference,
	connectReferences,
	nativeLink
} = require('../CommentGraphService.js');

const canonical = {
	kind: 'post', type: 'post', id: 'p2', heichelId: 'study', seriesId: 'root', label: 'Source', relation: 'supports'
};
const url = {
	kind: 'url', url: 'https://example.com', label: 'Outside', relation: 'cites'
};
assert.equal(canonicalReference(canonical), true);
assert.equal(canonicalReference(url), false);
assert.equal(nativeLink(canonical).relation, 'supports');
assert.equal(nativeLink(url).url, 'https://example.com');
assert.equal(nativeLink(url).relation, 'cites');

(async () => {
	const graph = await connectReferences({
		$i: {},
		comment: { id: 'c1', aliasId: 'teacher', heichelId: 'study', seriesId: 'root', postId: 'p1' },
		references: [canonical, url]
	});
	assert.equal(graph.length, 1);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].kind, 'references');
	assert.match(calls[0].note, /supports/);
	console.log('B"H CommentGraphService.test passed');
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
