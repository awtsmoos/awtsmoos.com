// B"H
// Boruch Hashem
// Blessed is He

process.env.AWTSMOOS_COMMAND_TIER = "5";
process.env.AWTSMOOS_COMMAND_MAX_ACTIVE = "8";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Helpers = require("./commandThousandHelpers.cjs");
const Store = require("../tools/fs/commandJobStore.js");
const Scheduler = require("../tools/fs/commandJob/scheduler.js");

const JOB_COUNT = 1000;
const AGENT_COUNT = 128;

/**
 * B"H
 * A thousand deeds arrive together through 128 agents, yet no receipt loses
 * its name. The Awtsmoos lets Awtsmoos.com admit an unbounded logical burst
 * while eight measured process vessels preserve order, fairness, and health.
 */
(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-thousand-"));
	const config = Helpers.commandConfig(root);
	const peaks = { active: 0, queued: 0 };
	let sampler;

	try {
		const starts = Array.from({ length: JOB_COUNT }, (_, index) =>
			Store.startCommandJob(config, {
				action: "commandStart",
				agentSessionId: `agent-${index % AGENT_COUNT}`,
				command: Helpers.delayedOutput(index),
				cwd: root,
				timeoutMs: 60000
			})
		);
		sampler = setInterval(() => observe(peaks), 5);
		const jobs = await Promise.all(starts);
		verifyIdentity(jobs);
		while (Scheduler.snapshot().active || Scheduler.snapshot().queued) {
			observe(peaks);
			await Helpers.sleep(20);
		}
		clearInterval(sampler);
		sampler = null;
		const completed = await Promise.all(jobs.map(job =>
			Store.commandWait(config, {
				jobId: job.jobId,
				waitTimeoutMs: 60000
			})
		));
		assert.ok(completed.every(job => job.status === "completed"));
		assert.equal(peaks.active, 8);
		assert.ok(peaks.queued >= 500, `peak queue was ${peaks.queued}`);
		await Helpers.verifySamples(Store, config, jobs, JOB_COUNT);
		const final = Scheduler.snapshot();
		assert.deepEqual([final.active, final.queued], [0, 0]);
		console.log(JSON.stringify({
			ok: true,
			suite: "command-thousand-queue-stress",
			jobs: JOB_COUNT,
			agents: AGENT_COUNT,
			peakActive: peaks.active,
			peakQueued: peaks.queued,
			finalActive: final.active,
			finalQueued: final.queued
		}, null, 2));
	} finally {
		if (sampler) clearInterval(sampler);
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

function verifyIdentity(jobs) {
	assert.equal(Helpers.unique(jobs, job => job.jobId), JOB_COUNT);
	assert.equal(Helpers.unique(jobs, job => job.workerId), JOB_COUNT);
	assert.equal(Helpers.unique(jobs, job => job.receiptId), JOB_COUNT);
	assert.equal(
		Helpers.unique(jobs, job => job.queue?.ownerId),
		AGENT_COUNT
	);
}

function observe(peaks) {
	const snapshot = Scheduler.snapshot();
	peaks.active = Math.max(peaks.active, snapshot.active);
	peaks.queued = Math.max(peaks.queued, snapshot.queued);
	assert.ok(snapshot.active <= 8);
}
