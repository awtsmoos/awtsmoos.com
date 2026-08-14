// B"H
// Boruch Hashem
// Blessed is He
/** @file Book worker retry and single-generation lease contract. */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createHttpSource } = require('../sourceHttp.js');
const lease = require('../workerLease.js');

async function proveRetry() {
	const originalFetch = global.fetch;
	let attempts = 0;
	global.fetch = async () => {
		attempts++;
		if (attempts < 3) throw new TypeError('synthetic transient failure');
		return {
			ok: true,
			status: 200,
			async json() {
				return { id: 'demo', prateem: { name: 'Retry Volume' } };
			}
		};
	};
	try {
		const source = createHttpSource('http://retry.test');
		const result = await source.series('ikar', 'demo');
		assert.equal(result.id, 'demo');
		assert.equal(attempts, 3);
	} finally {
		global.fetch = originalFetch;
	}
}

async function proveLease() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-book-lease-'));
	const previous = process.env.AWTSMOOS_BOOK_EXPORT_ROOT;
	process.env.AWTSMOOS_BOOK_EXPORT_ROOT = root;
	try {
		const first = lease.tryAcquire('job-a');
		assert.equal(first.jobId, 'job-a');
		assert.equal(lease.tryAcquire('job-b'), null);
		assert.equal(lease.readLease().jobId, 'job-a');
		assert.equal(lease.release('job-b'), false);
		assert.equal(lease.release('job-a'), true);

		fs.mkdirSync(root, { recursive: true });
		fs.writeFileSync(lease.leaseFile(), JSON.stringify({
			jobId: 'dead-job',
			pid: 2147483647,
			acquiredAt: 1
		}));
		const recovered = await lease.acquire('job-c');
		assert.equal(recovered.jobId, 'job-c');
		assert.equal(lease.release('job-c'), true);
	} finally {
		if (previous === undefined) delete process.env.AWTSMOOS_BOOK_EXPORT_ROOT;
		else process.env.AWTSMOOS_BOOK_EXPORT_ROOT = previous;
		fs.rmSync(root, { recursive: true, force: true });
	}
}

async function run() {
	await proveRetry();
	await proveLease();
	console.log('bookResilience.test.js PASS');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
