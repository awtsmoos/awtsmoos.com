//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const { createSiteRemixReceipt } = require('../../../../../sites/siteRemixReceipt.js');
const { bootstrapSiteProject } = require('../siteProjectBootstrap.js');
const { createDeployment } = require('../deploymentService.js');
const { recordSiteDeploymentDiscovery } = require('../siteDiscoveryRecord.js');
const { list } = require('../../platform/platformStore.js');
const { createDriveTestContext } = require('./testContext.js');

/**
 * @file Proves immutable Site deployment records durable discovery identities.
 * @description The Awtsmoos accepts Remix edges only when the public lineage can be
 * reverified against the configured server secret; ordinary Sites never invent parents.
 */
function parentReceipt($i) {
	return createSiteRemixReceipt({
		aliasId: 'parent',
		siteId: 'seed',
		canonicalUrl: '/sites/parent/seed/',
		sourceKind: 'drive-deployment',
		sourceRevision: 'd-parent-revision',
		files: [{ path: 'index.html', content: '<h1>Parent</h1>' }]
	}, $i);
}

async function publishChild($i, remixReceipt = null) {
	await bootstrapSiteProject({
		aliasId: 'child',
		projectId: 'child-site',
		siteId: 'child-site',
		title: 'Child Site',
		rootPath: 'sites/child-site',
		enabled: true,
		files: [{ path: 'index.html', content: '<h1>Child</h1>' }],
		remixReceipt,
		actor: { actorUserId: 'user-1' },
		actorUserId: 'user-1',
		$i
	});
	const deployment = await createDeployment({
		aliasId: 'child',
		siteId: 'child-site',
		projectId: 'child-site',
		actorUserId: 'user-1',
		idempotencyKey: `publish-${remixReceipt ? 'remix' : 'original'}`,
		expectedDeploymentId: null,
		$i
	});
	await recordSiteDeploymentDiscovery({
		aliasId: 'child',
		siteId: 'child-site',
		deploymentId: deployment.deployment.id,
		$i
	});
	return deployment;
}

function records($i, kind) {
	return list({
		$i,
		shard: 'search',
		predicate: record => record.meta?.kind === kind
	}).map(record => record.value);
}

test('ordinary immutable publish records one public Site and no Remix edge', async t => {
	const { $i } = createDriveTestContext(t, 'awts-discovery-original-');
	$i.self = { secret: 'test-only-strong-secret-ordinary-publish' };
	await publishChild($i);
	const sites = records($i, 'siteDiscovery');
	const edges = records($i, 'siteRemixEdge');
	assert.equal(sites.length, 1);
	assert.equal(sites[0].publicUrl, '/sites/child/child-site/');
	assert.equal(sites[0].verifiedRemix, false);
	assert.equal(edges.length, 0);
});

test('signed Remix publish records one independently verified parent edge', async t => {
	const { $i } = createDriveTestContext(t, 'awts-discovery-remix-');
	$i.self = { secret: 'test-only-strong-secret-remix-publish' };
	await publishChild($i, parentReceipt($i));
	const sites = records($i, 'siteDiscovery');
	const edges = records($i, 'siteRemixEdge');
	assert.equal(sites.length, 1);
	assert.equal(sites[0].verifiedRemix, true);
	assert.equal(edges.length, 1);
	assert.equal(edges[0].parent.publicUrl, '/sites/parent/seed/');
	assert.equal(edges[0].child.publicUrl, '/sites/child/child-site/');
	assert.match(edges[0].parent.sourceDigest, /^[a-f0-9]{64}$/);
});
