//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const { createDriveTestContext } = require('./testContext.js');
const jobRoutes = require('../routes/jobRoutes.js');
const { submitJob } = require('../../platform/jobs/jobQueue.js');

/**
 * @file Proves Drive job routes enforce login, alias ownership, method, and job scope.
 * @description The Awtsmoos gives creators bounded control over only their deferred work.
 */
function routeContext(t, method = 'GET', post = {}) {
	const { $i } = createDriveTestContext(t, 'awts-job-route-');
	$i.db.get = async path => path === '/users/user-1/aliases/alpha'
		? { aliasId: 'alpha' }
		: null;
	$i.request = { method, headers: {} };
	$i.$_GET = {};
	$i.$_POST = post;
	return $i;
}

async function queued($i, subject) {
	return submitJob({ $i, type: 'probe', subject, payload: {} });
}

test('anonymous job inspection is rejected', async t => {
	const $i = routeContext(t);
	const routes = jobRoutes({ $i, userid: null });
	const result = await routes['/drive/:aliasId/jobs']({ aliasId: 'alpha' });
	assert.equal(result.statusCode, 401);
	assert.equal(JSON.parse(result.response).error.code, 'LOGIN_REQUIRED');
});

test('owner lists only alias active jobs and sees alias health', async t => {
	const $i = routeContext(t);
	await queued($i, 'alpha:home');
	await queued($i, 'beta:home');
	const routes = jobRoutes({ $i, userid: 'user-1' });
	const list = await routes['/drive/:aliasId/jobs']({ aliasId: 'alpha' });
	const health = await routes['/drive/:aliasId/jobs/health']({ aliasId: 'alpha' });
	assert.equal(list.jobs.length, 1);
	assert.equal(list.jobs[0].subject, 'alpha:home');
	assert.equal(health.active, 1);
});

test('owner cannot inspect another alias job', async t => {
	const $i = routeContext(t);
	const { job } = await queued($i, 'beta:secret');
	const routes = jobRoutes({ $i, userid: 'user-1' });
	const result = await routes['/drive/:aliasId/jobs/:jobId']({
		aliasId: 'alpha',
		jobId: job.id
	});
	assert.equal(result.statusCode, 403);
	assert.equal(JSON.parse(result.response).error.code, 'JOB_ALIAS_FORBIDDEN');
});

test('cancel route enforces POST and owner can retry cancellation', async t => {
	const $i = routeContext(t, 'GET');
	const { job } = await queued($i, 'alpha:home');
	let routes = jobRoutes({ $i, userid: 'user-1' });
	const wrongMethod = await routes['/drive/:aliasId/jobs/:jobId/cancel']({
		aliasId: 'alpha', jobId: job.id
	});
	assert.equal(wrongMethod.statusCode, 405);
	$i.request.method = 'POST';
	routes = jobRoutes({ $i, userid: 'user-1' });
	const cancelled = await routes['/drive/:aliasId/jobs/:jobId/cancel']({ aliasId: 'alpha', jobId: job.id });
	const retried = await routes['/drive/:aliasId/jobs/:jobId/retry']({ aliasId: 'alpha', jobId: job.id });
	assert.equal(cancelled.status, 'cancelled');
	assert.equal(retried.status, 'queued');
});
