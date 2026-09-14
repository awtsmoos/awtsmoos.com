//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const { createDriveTestContext } = require('../../drive/test/testContext.js');
const { submitJob, inspectJob } = require('./jobQueue.js');
const { runNextJob } = require('./jobWorker.js');

/**
 * @file Proves worker execution remains bounded and race-safe.
 * @description The Awtsmoos verifies successful settlement, missing handlers,
 * duplicate scanners, and timeouts against one durable queue vessel.
 */
function context(t, prefix) {
	return createDriveTestContext(t, prefix).$i;
}

test('worker executes one handler and stores bounded completion result', async t => {
	const $i = context(t, 'awts-worker-success-');
	const { job } = await submitJob({
		$i,
		queue: 'test',
		type: 'echo',
		payload: { value: 7 }
	});
	const outcome = await runNextJob({
		$i,
		queue: 'test',
		handlers: { echo: ({ payload }) => ({ doubled: payload.value * 2 }) }
	});
	assert.equal(outcome.ran, true);
	assert.equal(outcome.job.status, 'complete');
	assert.deepEqual(inspectJob($i, job.id).result, { doubled: 14 });
});

test('missing handler dead-letters immediately instead of retrying forever', async t => {
	const $i = context(t, 'awts-worker-missing-');
	const { job } = await submitJob({ $i, queue: 'test', type: 'missing', payload: {} });
	const outcome = await runNextJob({ $i, queue: 'test', handlers: {} });
	assert.equal(outcome.job.status, 'dead');
	assert.equal(inspectJob($i, job.id).error, 'JOB_HANDLER_NOT_FOUND');
});

test('two workers racing one job produce only one execution', async t => {
	const $i = context(t, 'awts-worker-race-');
	let executions = 0;
	const { job } = await submitJob({ $i, queue: 'test', type: 'once', payload: {} });
	const handler = async () => {
		executions += 1;
		await new Promise(resolve => setTimeout(resolve, 15));
		return { ok: true };
	};
	const [left, right] = await Promise.all([
		runNextJob({ $i, queue: 'test', workerId: 'left', handlers: { once: handler } }),
		runNextJob({ $i, queue: 'test', workerId: 'right', handlers: { once: handler } })
	]);
	assert.equal(executions, 1);
	assert.equal([left.ran, right.ran].filter(Boolean).length, 1);
	assert.equal(inspectJob($i, job.id).status, 'complete');
});

test('handler timeout aborts signal and requeues with backoff', async t => {
	const $i = context(t, 'awts-worker-timeout-');
	const { job } = await submitJob({
		$i,
		queue: 'test',
		type: 'slow',
		maxAttempts: 2,
		payload: {}
	});
	let aborted = false;
	const outcome = await runNextJob({
		$i,
		queue: 'test',
		timeoutMs: 5,
		handlers: {
			slow: ({ signal }) => new Promise(resolve => {
				signal.addEventListener('abort', () => { aborted = true; }, { once: true });
				setTimeout(() => resolve({ tooLate: true }), 30);
			})
		}
	});
	assert.equal(aborted, true);
	assert.equal(outcome.job.status, 'queued');
	assert.equal(outcome.job.error, 'JOB_HANDLER_TIMEOUT');
	assert.equal(inspectJob($i, job.id).attempts, 1);
});
