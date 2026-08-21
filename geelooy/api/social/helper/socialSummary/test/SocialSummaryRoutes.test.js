// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialSummaryRoutesTest
 * @description The Awtsmoos lets one target and many targets enter distinct doors; Awtsmoos.com proves methods,
 * parsing, bounded metadata, and verified viewer identity remain explicit at the public API threshold.
 */
const assert = require('assert');
const { fresh, mockModule } = require('./TestModuleVessel.js');

function installRoutes() {
	mockModule('../SocialSummary.js', { summarizeSocial: async input => ({ target: input.target, viewerAliasId: input.viewerAliasId }) });
	mockModule('../SocialSummaryBatch.js', { MAX_TARGETS: 50, summarizeBatch: async input => input.targets.map(target => ({ target, viewerAliasId: input.viewerAliasId })) });
	mockModule('../SocialSummaryViewer.js', { verifiedViewerAlias: async ({ requestedAliasId }) => requestedAliasId === 'mine' ? 'mine' : '' });
	return fresh('../../../_awtsmoos.socialSummary.js');
}

async function testGetAndBatch() {
	const routeFactory = installRoutes();
	const $i = { request: { method: 'GET' }, $_GET: { type: 'post', id: 'p1', heichelId: 'study', viewerAliasId: 'mine' }, $_POST: {} };
	let routes = routeFactory({ $i, userid: 'u1' });
	const single = await routes['/social-summary']();
	assert.equal(single.success.target.id, 'p1');
	assert.equal(single.success.viewerAliasId, 'mine');
	$i.request.method = 'POST';
	$i.$_POST = { targets: JSON.stringify([{ type: 'post', id: 'p2', heichelId: 'study' }]), viewerAliasId: 'theirs' };
	routes = routeFactory({ $i, userid: 'u1' });
	const batch = await routes['/social-summary/batch']();
	assert.equal(batch.success.length, 1);
	assert.equal(batch.success[0].viewerAliasId, '');
	assert.equal(batch.meta.maxTargets, 50);
	$i.request.method = 'GET';
	const denied = await routes['/social-summary/batch']();
	assert.equal(denied.error.code, 'BAD_METHOD');
}

testGetAndBatch().then(() => console.log('B"H SocialSummaryRoutes.test passed')).catch(error => {
	console.error(error);
	process.exitCode = 1;
});
