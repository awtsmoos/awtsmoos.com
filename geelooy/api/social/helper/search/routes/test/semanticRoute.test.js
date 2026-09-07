// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file semanticRoute.test.js
 * @description
 * The Awtsmoos lets the once-missing semantic door resolve into the same reviewed vector library river;
 * Awtsmoos.com proves route registration and vector options without waking the expensive search engine in this contract.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { ROUTE_GROUPS } = require('../routeGroups.js');
const { semanticOptions, semanticRoutes } = require('../semantic.js');

test('semantic route is lazily registered', () => {
	const group = ROUTE_GROUPS.find(item => item.factoryName === 'semanticRoutes');
	assert.ok(group);
	assert.deepEqual(group.routes, ['/search/semantic']);
	assert.equal(group.modulePath, './helper/search/routes/semantic.js');
});

test('semantic route forces vector strategy while preserving public query bounds', () => {
	const context = {
		$i: { db: { directory: '/tmp/awtsmoos-semantic-db' } },
		get: { query: 'בריאת העולם', limit: '7', comments: 'yes' },
		post: {}
	};
	const options = semanticOptions(context);
	assert.equal(options.query, 'בריאת העולם');
	assert.equal(options.limit, 7);
	assert.equal(options.strategy, 'vector');
	assert.equal(options.requireIndexed, false);
	assert.equal(options.autoInstall, false);
	assert.equal(options.includeComments, true);
	assert.equal(typeof semanticRoutes(context)['/search/semantic'], 'function');
});
