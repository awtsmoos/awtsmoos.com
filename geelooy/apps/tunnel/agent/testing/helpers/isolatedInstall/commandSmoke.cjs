// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Requests = require("./requests.cjs");

/**
 * @file Proves command jobs by their own durable status instead of unrelated stats.
 * @description
 * The Awtsmoos gives each command a private worker covenant and a durable job record.
 * Awtsmoos.com therefore proves a long command through commandStatus, then proves its
 * cancellation and output without assuming the general action-worker registry owns it.
 */
async function run(relay) {
	const completed = await start(
		relay,
		"command-complete",
		nodeCommand("console.log('COMMAND_ALPHA')")
	);
	assert.ok(completed.jobId);
	assert.ok(completed.workerId);
	const waited = await Requests.sendRequest(relay, "command-wait", {
		kind: "command",
		action: "commandWait",
		jobId: completed.jobId,
		waitTimeoutMs: 10000,
		pollIntervalMs: 25,
		maxChars: 2000
	});
	assert.equal(waited.status, "completed", JSON.stringify(waited));
	const page = await Requests.sendRequest(relay, "command-output", {
		kind: "command",
		action: "commandJobOutputPage",
		jobId: completed.jobId,
		stream: "stdout",
		maxChars: 2000
	});
	assert.match(page.content, /COMMAND_ALPHA/);

	const long = await start(relay, "command-long", nodeCommand("setInterval(()=>{},1000)"));
	const running = await Requests.sendRequest(relay, "command-long-status", {
		kind: "command",
		action: "commandStatus",
		jobId: long.jobId
	});
	assert.equal(running.status, "running", JSON.stringify(running));
	assert.equal(running.worker.state, "running");
	const cancelled = await Requests.sendRequest(relay, "command-cancel", {
		kind: "command",
		action: "commandCancel",
		jobId: long.jobId
	});
	assert.equal(cancelled.status, "cancelled", JSON.stringify(cancelled));
	const cancelledStatus = await Requests.sendRequest(relay, "command-cancel-status", {
		kind: "command",
		action: "commandStatus",
		jobId: long.jobId
	});
	assert.equal(cancelledStatus.status, "cancelled");
	assert.equal(cancelledStatus.worker.state, "cancelled");

	const count = Math.max(1, Number(process.env.AWTSMOOS_INSTALL_SMOKE_COMMANDS || 4));
	await runIsolated(relay, count);
	return { completedJobId: completed.jobId, cancelledJobId: long.jobId, isolatedCommands: count };
}

async function start(relay, id, command) {
	const response = await Requests.sendRequest(relay, id, {
		kind: "command",
		action: "commandRun",
		command,
		cwd: ".",
		timeoutMs: 30000,
		noMission: true
	});
	assert.equal(response.ok, true, JSON.stringify(response));
	return response;
}

async function runIsolated(relay, count) {
	const jobs = await Promise.all(Array.from({ length: count }, (_, index) => {
		return start(relay, `isolation-start-${index}`, nodeCommand(`console.log('ISOLATED_${index}')`));
	}));
	await Promise.all(jobs.map((job, index) => waitForCompleted(relay, job, index)));
	await Promise.all(jobs.map((job, index) => Requests.sendRequest(relay, `isolation-output-${index}`, {
		kind: "command",
		action: "commandJobOutputPage",
		jobId: job.jobId,
		stream: "stdout",
		maxChars: 2000
	}).then(result => assert.match(result.content, new RegExp(`ISOLATED_${index}`)))));
}

async function waitForCompleted(relay, job, index) {
	const deadline = Date.now() + 60000;
	let attempt = 0;
	while (Date.now() < deadline) {
		const result = await Requests.sendRequest(relay, `isolation-wait-${index}-${attempt++}`, {
			kind: "command",
			action: "commandWait",
			jobId: job.jobId,
			waitTimeoutMs: 4500,
			pollIntervalMs: 25
		}, 15000);
		if (result.status === "completed") return result;
		if (result.done) assert.fail(JSON.stringify(result));
	}
	assert.fail(`command_wait_deadline:${job.jobId}`);
}

function nodeCommand(script) {
	return `${JSON.stringify(process.execPath)} -e ${JSON.stringify(script)}`;
}

module.exports = { nodeCommand, run, runIsolated, start };
