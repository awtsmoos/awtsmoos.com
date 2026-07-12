// B"H
const assert = require('node:assert/strict');
const Requests = require('./requests.cjs');

/**
 * B"H — The installed agent proves command identity, output isolation, bounded
 * control, cancellation, and worker visibility over the actual relay envelope.
 */
async function run(relay) {
	const completed = await start(relay, 'command-complete', nodeCommand("console.log('COMMAND_ALPHA')"));
	assert.equal(completed.action, 'commandRun');
	assert.ok(completed.jobId);
	assert.ok(completed.workerId);
	const waited = await Requests.sendRequest(relay, 'command-wait', {
		kind: 'command',
		action: 'commandWait',
		jobId: completed.jobId,
		waitTimeoutMs: 10000,
		pollIntervalMs: 25,
		maxChars: 2000
	});
	assert.equal(waited.status, 'completed', JSON.stringify(waited));
	const page = await Requests.sendRequest(relay, 'command-output', {
		kind: 'command',
		action: 'commandJobOutputPage',
		jobId: completed.jobId,
		stream: 'stdout',
		maxChars: 2000
	});
	assert.match(page.content, /COMMAND_ALPHA/);

	const long = await start(relay, 'command-long', nodeCommand('setInterval(()=>{},1000)'));
	const pong = await Requests.sendPing(relay);
	assert.equal(pong.queueStats.workers.active[long.workerId].jobId, long.jobId);
	const cancelled = await Requests.sendRequest(relay, 'command-cancel', {
		kind: 'command',
		action: 'commandCancel',
		jobId: long.jobId
	});
	assert.equal(cancelled.status, 'cancelled', JSON.stringify(cancelled));
	const cancelledStatus = await Requests.sendRequest(relay, 'command-cancel-status', {
		kind: 'command',
		action: 'commandStatus',
		jobId: long.jobId
	});
	assert.equal(cancelledStatus.status, 'cancelled');
	assert.equal(cancelledStatus.worker.state, 'cancelled');

	const isolated = await runIsolated(relay, 20);
	return {
		completedJobId: completed.jobId,
		cancelledJobId: long.jobId,
		workerVisible: true,
		isolatedCommands: isolated
	};
}

async function start(relay, id, command) {
	const response = await Requests.sendRequest(relay, id, {
		kind: 'command',
		action: 'commandRun',
		command,
		cwd: '.',
		timeoutMs: 30000,
		noMission: true
	});
	assert.equal(response.ok, true, JSON.stringify(response));
	return response;
}

async function runIsolated(relay, count) {
	const jobs = await Promise.all(Array.from({ length: count }, async (_, index) => {
		return start(relay, `isolation-start-${index}`, nodeCommand(`console.log('ISOLATED_${index}')`));
	}));
	await Promise.all(jobs.map((job, index) => Requests.sendRequest(relay, `isolation-wait-${index}`, {
		kind: 'command',
		action: 'commandWait',
		jobId: job.jobId,
		waitTimeoutMs: 30000,
		pollIntervalMs: 25
	}, 40000).then(result => assert.equal(result.status, 'completed', JSON.stringify(result)))));
	await Promise.all(jobs.map((job, index) => Requests.sendRequest(relay, `isolation-output-${index}`, {
		kind: 'command',
		action: 'commandJobOutputPage',
		jobId: job.jobId,
		stream: 'stdout',
		maxChars: 2000
	}).then(result => assert.match(result.content, new RegExp(`ISOLATED_${index}`)))));
	return count;
}

function nodeCommand(script) {
	return `${JSON.stringify(process.execPath)} -e ${JSON.stringify(script)}`;
}

module.exports = { nodeCommand, run, runIsolated, start };
