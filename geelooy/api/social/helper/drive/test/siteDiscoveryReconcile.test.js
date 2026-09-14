//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const { createDriveTestContext } = require('./testContext.js');
const { bootstrapSiteProject } = require('../siteProjectBootstrap.js');
const { createDeployment } = require('../deploymentService.js');
const { reconcileSiteDiscovery } = require('../siteDiscoveryReconcile.js');
const { startSiteDiscoveryRuntime } = require('../siteDiscoveryRuntime.js');
const { inspectJobs } = require('../../platform/jobs/jobQueue.js');
const { list } = require('../../platform/platformStore.js');

/**
 * @file Proves restart recovery re-enqueues committed immutable Sites in bounded pages.
 * @description The Awtsmoos rebuilds optional discovery intent after a process rupture
 * without scanning every alias in one pass or duplicating one deployment's durable job.
 */
function aliasSource(ids) {
	return {
		count: async () => ids.length,
		list: async ({ page, pageSize }) => ids.slice((page - 1) * pageSize, page * pageSize)
	};
}
async function waitForDiscoveryJob($i, status, timeoutMs = 1_500) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const [job] = inspectJobs($i, { queue: 'site-discovery', limit: 10 });
		if (job?.status === status) return job;
		await new Promise(resolve => setTimeout(resolve, 20));
	}
	return inspectJobs($i, { queue: 'site-discovery', limit: 10 })[0] || null;
}

async function seedDeployment($i, aliasId, siteId) {
	await bootstrapSiteProject({
		aliasId,
		projectId: siteId,
		siteId,
		title: siteId,
		rootPath: `sites/${siteId}`,
		enabled: true,
		files: [{ path: 'index.html', content: '<h1>B"H</h1>' }],
		actor: { actorUserId: 'user-1' },
		actorUserId: 'user-1',
		$i
	});
	const quiet = { ...$i, request: null };
	return createDeployment({
		aliasId,
		siteId,
		projectId: siteId,
		actorUserId: 'user-1',
		idempotencyKey: `deploy-${aliasId}-${siteId}`,
		expectedDeploymentId: null,
		$i: quiet
	});
}

test('reconciliation advances bounded alias pages and replays one job per deployment', async t => {
	const { $i } = createDriveTestContext(t, 'awts-site-reconcile-');
	const aliases = aliasSource(['alpha', 'beta']);
	await seedDeployment($i, 'alpha', 'home');
	await seedDeployment($i, 'beta', 'docs');
	const first = await reconcileSiteDiscovery({ $i, page: 1, pageSize: 1, aliasSource: aliases });
	const second = await reconcileSiteDiscovery({ $i, page: first.nextPage, pageSize: 1, aliasSource: aliases });
	const jobs = inspectJobs($i, { queue: 'site-discovery', limit: 10 });
	assert.equal(first.scannedAliases, 1);
	assert.equal(second.scannedAliases, 1);
	assert.equal(first.totalPages, 2);
	assert.equal(second.nextPage, 1);
	assert.equal(jobs.length, 2);
	await reconcileSiteDiscovery({ $i, page: 1, pageSize: 1, aliasSource: aliases });
	assert.equal(inspectJobs($i, { queue: 'site-discovery', limit: 10 }).length, 2);
});

test('runtime reconciles a missed deployment and drains its durable job', async t => {
	const { $i } = createDriveTestContext(t, 'awts-site-runtime-');
	const aliases = aliasSource(['gamma']);
	await seedDeployment($i, 'gamma', 'home');
	assert.equal(inspectJobs($i, { queue: 'site-discovery', limit: 10 }).length, 0);
	const runtime = startSiteDiscoveryRuntime({
		db: $i.db,
		drainMs: 10,
		reconcileMs: 20,
		pageSize: 10,
		maxJobs: 5,
		aliasSource: aliases
	});
	const job = await waitForDiscoveryJob($i, 'complete');
	runtime.stop();
	assert.ok(job);
	assert.equal(job.status, 'complete');
	const sites = list({ $i, shard: 'search', predicate: record => record.meta?.kind === 'siteDiscovery' });
	assert.equal(sites.length, 1);
	assert.equal(runtime.snapshot().stopped, true);
});
