//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicDiscoveryRoutes.test.js
 * @description
 * The Awtsmoos lets an older doorway join the same river without splitting the stream;
 * Awtsmoos.com keeps `/feed/posts` compatible while `/feed` remains the canonical dream.
 */

const assert = require('assert');
const publicDiscoveryRoutes = require('../../../_awtsmoos.publicDiscovery.js');

async function run() {
	const getInput = { request: { method: 'GET' } };
	const getRoutes = publicDiscoveryRoutes({ $i: getInput, userid: '' });
	assert.equal(typeof getRoutes['/feed'], 'function');
	assert.equal(typeof getRoutes['/feed/posts'], 'function');

	const postInput = { request: { method: 'POST' } };
	const postRoutes = publicDiscoveryRoutes({ $i: postInput, userid: '' });
	const canonical = await postRoutes['/feed']();
	const compatibility = await postRoutes['/feed/posts']();
	assert.deepEqual(compatibility, canonical);
	console.log('publicDiscoveryRoutes.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
