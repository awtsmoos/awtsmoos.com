// B"H
const assert = require('node:assert/strict');
const Requests = require('./requests.cjs');

/** B"H — One soak batch mixes success, failure, cancellation, and output paging. */
async function start(relay, startIndex) {
	const modes = [
		'complete','complete','complete','complete','complete','complete',
		'fail','fail','cancel','cancel'
	];
	return Promise.all(modes.map(async (mode, offset) => {
		const index = startIndex + offset;
		const script = scriptFor(mode, index);
		const response = await Requests.sendRequest(relay, `soak-start-${index}`, {
			kind: 'command',
			action: 'commandRun',
			command: `${JSON.stringify(process.execPath)} -e ${JSON.stringify(script)}`,
			cwd: '.',
			timeoutMs: 30000,
			noMission: true,
			agentSessionId: `soak-agent-${index % 20}`
		});
		assert.equal(response.ok, true, JSON.stringify(response));
		return { index, mode, jobId: response.jobId };
	}));
}

async function settle(relay, batch, counts) {
	for (const job of batch) {
		if (job.mode === 'cancel') {
			const result = await Requests.sendRequest(relay, `soak-cancel-${job.index}`, {
				kind: 'command',
				action: 'commandCancel',
				jobId: job.jobId
			});
			assert.equal(result.status, 'cancelled', JSON.stringify(result));
			counts.cancelled += 1;
			continue;
		}
		const result = await Requests.sendRequest(relay, `soak-wait-${job.index}`, {
			kind: 'command',
			action: 'commandWait',
			jobId: job.jobId,
			waitTimeoutMs: 10000,
			pollIntervalMs: 25
		}, 20000);
		if (job.mode === 'fail') {
			assert.equal(result.status, 'failed', JSON.stringify(result));
			counts.failed += 1;
		} else {
			assert.equal(result.status, 'completed', JSON.stringify(result));
			counts.completed += 1;
		}
	}
}

async function verifyOutput(relay, job) {
	const page = await Requests.sendRequest(relay, `soak-output-${job.index}`, {
		kind: 'command',
		action: 'commandJobOutputPage',
		jobId: job.jobId,
		stream: 'stdout',
		maxChars: 1000
	});
	assert.match(page.content, new RegExp(`SOAK_${job.index}`));
}

function scriptFor(mode, index) {
	if (mode === 'complete') return `console.log('SOAK_${index}')`;
	if (mode === 'fail') return 'process.exit(3)';
	return 'setInterval(()=>{},1000)';
}

module.exports = { scriptFor, settle, start, verifyOutput };
