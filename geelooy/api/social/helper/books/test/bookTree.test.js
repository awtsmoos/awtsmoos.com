// B"H
// Boruch Hashem
// Blessed is He
/** @file Recursive series planning and combined-post deduplication contract. */
const assert = require('assert');
const { postPairs } = require('../bookBuilder.js');
const { targetNodes, walkSeries } = require('../seriesTree.js');
const { parse } = require('../options.js');

const children = {
	root: ['a', 'b'],
	a: [],
	b: ['c'],
	c: []
};
const posts = {
	root: ['shared'],
	a: ['a1', 'shared'],
	b: [],
	c: ['c1']
};
const source = {
	async series(heichel, id) { return { prateem: { name: `Name ${id}` } }; },
	async children(heichel, id) { return children[id] || []; },
	async postIds(heichel, id) { return posts[id] || []; }
};

async function run() {
	const options = parse({ mode: 'leaves', maxDepth: 5, maxBooks: 10 });
	const tree = await walkSeries({ source, heichelId: 'ikar', seriesId: 'root', options });
	const leaves = targetNodes(tree, 'leaves', 10);
	assert.deepStrictEqual(leaves.map(node => node.id), ['a', 'c']);
	assert.deepStrictEqual(targetNodes(tree, 'combined', 10).map(node => node.id), ['root']);
	const pairs = postPairs(tree, true);
	assert.deepStrictEqual(pairs.map(pair => pair.postId), ['shared', 'a1', 'c1']);
	assert.equal(pairs.find(pair => pair.postId === 'shared').seriesId, 'root');

	const cycleSource = {
		...source,
		async children(heichel, id) { return id === 'root' ? ['root'] : []; }
	};
	await assert.rejects(
		() => walkSeries({ source: cycleSource, heichelId: 'ikar', seriesId: 'root', options }),
		/cycle detected/
	);
	console.log('bookTree.test.js PASS');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
