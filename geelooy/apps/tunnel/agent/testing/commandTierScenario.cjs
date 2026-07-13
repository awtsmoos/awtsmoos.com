// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Store = require("../tools/fs/commandJobStore.js");
const Scheduler = require("../tools/fs/commandJob/scheduler.js");

/**
 * B"H
 * One tier is tested inside one fresh process, so no cached scheduler can hide
 * its measure. The Awtsmoos lets Awtsmoos.com observe every worker and receipt.
 */
(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-tier-stress-"));
	const config = commandConfig(root);
	const initial = Scheduler.snapshot();
	const count = Math.min(initial.maxActive + 4, 36);
	const jobs = [];
	let maxObserved = 0;
	let queueObserved = false;

	try {
		for (let index = 0; index < count; index += 1) {
			jobs.push(await Store.startCommandJob(config, {
				action: "commandStart",
				agentSessionId: `tier-${initial.concurrencyTier}-agent-${index}`,
				command: delayedOutput(index),
				cwd: root,
				timeoutMs: 20000
			}));
			const snapshot = Scheduler.snapshot();
			maxObserved = Math.max(maxObserved, snapshot.active);
			queueObserved ||= snapshot.queued > 0;
		}
		assert.equal(unique(jobs, "jobId"), count);
		assert.equal(unique(jobs, "workerId"), count);
		assert.equal(unique(jobs, "receiptId"), count);

		while (Scheduler.snapshot().active || Scheduler.snapshot().queued) {
			const snapshot = Scheduler.snapshot();
			maxObserved = Math.max(maxObserved, snapshot.active);
			queueObserved ||= snapshot.queued > 0;
			await sleep(20);
		}
		const completed = await Promise.all(jobs.map(job =>
			Store.commandWait(config, {
				jobId: job.jobId,
				waitTimeoutMs: 20000
			})
		));
		assert.ok(completed.every(job => job.status === "completed"));
		assert.equal(maxObserved, Math.min(initial.maxActive, count));
		assert.equal(queueObserved, count > initial.maxActive);
		await verifyOutput(config, jobs);
		console.log(JSON.stringify({
			tier: initial.concurrencyTier,
			profile: initial.concurrencyProfile,
			maxActive: initial.maxActive,
			maxObserved,
			jobs: count,
			queueObserved
		}));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

async function verifyOutput(config, jobs) {
	for (let index = 0; index < jobs.length; index += 1) {
		const page = await Store.commandJobOutputPage(config, {
			jobId: jobs[index].jobId,
			stream: "stdout",
			maxChars: 200
		});
		assert.match(page.content, new RegExp(`TIER_${index}`));
	}
}

function unique(items, key) {
	return new Set(items.map(item => item[key])).size;
}

function commandConfig(root) {
	return {
		root,
		deviceStateRoot: path.join(root, ".state"),
		allowCommands: true,
		tools: { command: true },
		command: { enabled: true, defaultShell: "/bin/sh" }
	};
}

function delayedOutput(index) {
	const script = `setTimeout(()=>process.stdout.write('TIER_${index}'),1200)`;
	return `${JSON.stringify(process.execPath)} -e ${JSON.stringify(script)}`;
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
