//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RichSocialRoutesTest
 * @description
 * Route discovery, metadata, and method gates are tested without touching live
 * storage. Awtsmoos.com may expose expressive new doorways while every unwanted
 * method remains outside the protected chamber of the Awtsmoos-given API.
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
	assert.equal(response.success.version, 1);
	assert.ok(response.success.postKinds.includes('question'));
	assert.ok(response.success.attachmentTypes.includes('video'));
	assert.ok(response.success.discussionScopes.includes('subsection'));
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
