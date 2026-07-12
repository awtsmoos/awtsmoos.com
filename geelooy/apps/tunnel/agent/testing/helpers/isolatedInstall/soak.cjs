// B"H
const assert = require('node:assert/strict');
const Batch = require('./soakBatch.cjs');
const Metrics = require('./soakMetrics.cjs');
const Requests = require('./requests.cjs');

/** B"H — Repeated cycles return every slot, worker, child, and handle. */
async function run(options, processRecord, durationMs) {
	const startedAt = Date.now();
	const samples = [Metrics.sample(processRecord, options)];
	const counts = { completed: 0, failed: 0, cancelled: 0 };
	let sequence = 0;
	while (Date.now() - startedAt < durationMs) {
		const batch = await Batch.start(options.relay, sequence);
		sequence += batch.length;
		await Batch.settle(options.relay, batch, counts);
		await Batch.verifyOutput(
			options.relay,
			batch.find(job => job.mode === 'complete')
		);
		const pong = await Requests.sendPing(options.relay, 10000);
		assert.equal(pong.queueStats.commands.active, 0);
		assert.equal(pong.queueStats.commands.queued, 0);
		assert.equal(pong.queueStats.workers.activeTotal, 0);
		samples.push(Metrics.sample(processRecord, options));
		await sleep(25);
	}
	const first = samples[0];
	const last = samples.at(-1);
	assert.ok(
		last.rssKb - first.rssKb < 100 * 1024,
		JSON.stringify({ first, last })
	);
	assert.ok(
		Math.max(...samples.map(row => row.openHandles)) - first.openHandles < 60
	);
	assert.equal(last.childProcesses, 0);
	return {
		durationMs: Date.now() - startedAt,
		...counts,
		batches: samples.length - 1,
		first,
		last,
		maxRssKb: Math.max(...samples.map(row => row.rssKb)),
		maxOpenHandles: Math.max(...samples.map(row => row.openHandles)),
		maxStoreBytes: Math.max(...samples.map(row => row.storeBytes))
	};
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { run };
