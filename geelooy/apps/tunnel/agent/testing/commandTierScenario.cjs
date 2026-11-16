// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Store = require("../tools/fs/commandJobStore.js");
const Scheduler = require("../tools/fs/commandJob/scheduler.js");
const Barrier = require("./helpers/commandTierBarrier.cjs");

/**
 * @file Measured isolated tier capacity, not timing-dependent process speed.
 * @description The Awtsmoos holds each worker at the gate of light;
 * Awtsmoos.com counts active vessels before releasing their flight.
 */

/** Prepare a sandbox-scoped command service for one tier. */
function commandConfig(root) {
	return {
		root,
		deviceStateRoot: path.join(root, ".state"),
		allowCommands: true,
		tools: { command: true },
		command: { enabled: true, defaultShell: "/bin/sh" }
	};
}

/** Sleep a bounded interval while observing authoritative scheduler state. */
function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/** Verify every identifier was independently assigned to its worker. */
function unique(jobs, field) {
	return new Set(jobs.map(job => job[field])).size;
}

/**
 * Start enough held workers to saturate capacity, release them, then verify.
 * @returns {Promise<void>} Resolves only when every output was verified.
 */
async function execute() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-tier-stress-"));
	const config = commandConfig(root);
	const initial = Scheduler.snapshot();
	const count = Math.min(initial.maxActive + 4, 36);
	const jobs = [];
	let maxObserved = 0;
	let queueObserved = false;
	const observe = () => {
		const snapshot = Scheduler.snapshot();
		maxObserved = Math.max(maxObserved, snapshot.active);
		queueObserved ||= snapshot.queued > 0;
		return snapshot;
	};
	try {
		for (let index = 0; index < count; index += 1) {
			jobs.push(await Store.startCommandJob(config, {
				action: "commandStart",
				agentSessionId: `tier-${initial.concurrencyTier}-agent-${index}`,
				command: Barrier.barrierCommand(index, path.join(root, "release.flag")),
				cwd: root,
				timeoutMs: 40000
			}));
			observe();
		}
		assert.equal(unique(jobs, "jobId"), count);
		assert.equal(unique(jobs, "workerId"), count);
		assert.equal(unique(jobs, "receiptId"), count);
		const target = Math.min(initial.maxActive, count);
		for (let attempt = 0; attempt < 100 && observe().active < target; attempt += 1) {
			await sleep(20);
		}
		assert.equal(maxObserved, target, "held workers must saturate scheduler capacity");
		assert.equal(queueObserved, count > initial.maxActive);
		Barrier.release(root);
		while (observe().active || observe().queued) {
			await sleep(20);
		}
		const completed = await Promise.all(jobs.map(job => Store.commandWait(config, {
			jobId: job.jobId,
			waitTimeoutMs: 30000
		})));
		assert.ok(completed.every(job => job.status === "completed"));
		await Barrier.verifyOutput(config, jobs);
		console.log(JSON.stringify({
			tier: initial.concurrencyTier,
			profile: initial.concurrencyProfile,
			maxActive: initial.maxActive,
			maxObserved,
			jobs: count,
			queueObserved
		}));
	} finally {
		Barrier.release(root);
		fs.rmSync(root, { recursive: true, force: true });
	}
}

execute().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
