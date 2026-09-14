//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const { createDriveTestContext } = require('./testContext.js');
const { bootstrapSiteProject } = require('../siteProjectBootstrap.js');
const { createDeployment } = require('../deploymentService.js');
const { inspectJobs } = require('../../platform/jobs/jobQueue.js');
const { list } = require('../../platform/platformStore.js');
const { enqueueAndRunSiteDiscovery, enqueueSiteDiscovery } = require('../siteDiscoveryJob.js');

/**
 * @file Proves immutable Site discovery is durable, idempotent queued work.
 * @description The Awtsmoos separates publication authority from rebuildable search
 * projection while Awtsmoos.com preserves one logical discovery job per deployment.
 */
async function deployedSite($i) {
	await bootstrapSiteProject({
		aliasId: 'owner',
		projectId: 'home',
		siteId: 'home',
		title: 'Home',
		rootPath: 'sites/home',
		enabled: true,
		files: [{ path: 'index.html', content: '<h1>B"H</h1>' }],
		actor: { actorUserId: 'user-1' },
		actorUserId: 'user-1',
		$i
	});
	return createDeployment({
		aliasId: 'owner',
		siteId: 'home',
		projectId: 'home',
		actorUserId: 'user-1',
		idempotencyKey: 'deploy-home',
		expectedDeploymentId: null,
		$i
	});
}

test('one deployment creates one idempotent discovery job and one public record', async t => {
	const { $i } = createDriveTestContext(t, 'awts-site-discovery-job-');
	const deployment = await deployedSite($i);
	const input = {
		$i,
		aliasId: 'owner',
		siteId: 'home',
		deploymentId: deployment.deployment.id
	};
	const first = await enqueueAndRunSiteDiscovery(input);
	const replay = await enqueueSiteDiscovery(input);
	assert.equal(first.outcome.job.status, 'complete');
	assert.equal(first.outcome.job.result.recorded, true);
	assert.equal(replay.replayed, true);
	const jobs = inspectJobs($i, { queue: 'site-discovery', limit: 10 });
	assert.equal(jobs.length, 1);
	assert.equal(jobs[0].status, 'complete');
	const sites = list({
		$i,
		shard: 'search',
		predicate: record => record.meta?.kind === 'siteDiscovery'
	});
	assert.equal(sites.length, 1);
	assert.equal(sites[0].value.publicUrl, '/sites/owner/home/');
});
