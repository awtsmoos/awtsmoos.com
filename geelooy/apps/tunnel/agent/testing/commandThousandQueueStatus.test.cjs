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
 * @file Reveals every non-completed status in the thousand-command queue gate.
 * @description
 * The Awtsmoos names every ending before judgment. Awtsmoos.com records bounded
 * representative failures so a saturated host cannot hide timeout, spawn, output,
 * or finalization defects behind one undifferentiated assertion.
 */
(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-thousand-status-"));
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
		const counts = statusCounts(completed);
		const failures = completed
			.filter(job => job.status !== "completed")
			.slice(0, 12)
			.map(job => failureView(job));
		console.log(JSON.stringify({
			ok: failures.length === 0,
			counts,
			failures,
			peakActive: peaks.active,
			peakQueued: peaks.queued
		}, null, 2));
		assert.equal(counts.completed, JOB_COUNT);
		assert.equal(peaks.active, 8);
		assert.ok(peaks.queued >= 500, `peak queue was ${peaks.queued}`);
	} finally {
		if (sampler) clearInterval(sampler);
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

function statusCounts(jobs) {
	return jobs.reduce((counts, job) => {
		const status = String(job.status || "missing");
		counts[status] = Number(counts[status] || 0) + 1;
		return counts;
	}, {});
}

function failureView(job) {
	return {
		jobId: job.jobId,
		status: job.status,
		error: job.error || null,
		exitCode: job.exitCode ?? null,
		signal: job.signal || null,
		waitTimedOut: Boolean(job.waitTimedOut),
		workerState: job.worker?.state || null
	};
}

function observe(peaks) {
	const snapshot = Scheduler.snapshot();
	peaks.active = Math.max(peaks.active, snapshot.active);
	peaks.queued = Math.max(peaks.queued, snapshot.queued);
	assert.ok(snapshot.active <= 8);
}
