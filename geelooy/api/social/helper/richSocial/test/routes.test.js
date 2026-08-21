//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RichSocialRoutesTest
 * @description
 * The Awtsmoos lets a public contract evolve without stale tests pulling it backward;
 * Awtsmoos.com verifies version-two creator metadata, route discovery, and method gates on the guarded track.
 */

const assert = require('assert');
const createRoutes = require('../../../_awtsmoos.richSocial.js');

async function testMetadata() {
	const $i = {
		request: { method: 'GET' },
		$_GET: {},
		$_POST: {}
	};
	const routes = createRoutes({ $i });
	const response = await routes['/rich-social/meta']();
	assert.equal(response.success.version, 2);
	assert.ok(response.success.postKinds.includes('question'));
	assert.ok(response.success.attachmentTypes.includes('video'));
	assert.ok(response.success.discussionScopes.includes('subsection'));
	assert.ok(response.success.creatorMetadataFields.length > 0);
	assert.ok(response.success.creatorSocialFields.length > 0);
	assert.ok(response.success.creatorDistributionFields.length > 0);
}

async function testRouteSurfaceAndMethodGate() {
	const $i = {
		request: { method: 'GET' },
		$_GET: {},
		$_POST: {}
	};
	const routes = createRoutes({ $i });
	const expected = [
		'/heichelos/:heichel/series/:series/rich-posts',
		'/heichelos/:heichel/questions/:question/rich-answers',
		'/heichelos/:heichel/posts/:entity/discussion-targets',
		'/heichelos/:heichel/questions/:entity/discussion-targets',
		'/heichelos/:heichel/answers/:entity/discussion-targets'
	];
	for (const route of expected) assert.equal(typeof routes[route], 'function');
	const rejected = await routes['/heichelos/:heichel/series/:series/rich-posts']({
		heichel: 'study',
		series: 'root'
	});
	assert.equal(rejected.error.code, 'METHOD_NOT_ALLOWED');
}

async function run() {
	await testMetadata();
	await testRouteSurfaceAndMethodGate();
	console.log('B"H richSocial routes.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
