// B"H
// Boruch Hashem
// Blessed is He

process.env.AWTSMOOS_COMMAND_MAX_ACTIVE = "2";
process.env.AWTSMOOS_COMMAND_MAX_QUEUED = "20";
process.env.AWTSMOOS_COMMAND_MAX_QUEUED_PER_OWNER = "10";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Store = require("../tools/fs/commandJobStore.js");
const Scheduler = require("../tools/fs/commandJob/scheduler.js");

const ACTIVE_START_STATES = new Set(["spawning", "running", "detached_running"]);

/**
 * @file Proves two production slots rotate owners across durable worker startup.
 * @description
 * The Awtsmoos lets process birth have a truthful spawning moment before running;
 * Awtsmoos.com tests scheduler fairness across that durable lifecycle rather than
 * requiring the older illusion that every admitted worker is instantly running.
 */
(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "production-fairness-"));
	const config = commandConfig(root);
	const orderFile = path.join(root, "order.txt");
	const releaseFile = path.join(root, "release.txt");
	try {
		const blockerOne = await start(config, "blocker-one", waitCommand(releaseFile));
		const blockerTwo = await start(config, "blocker-two", waitCommand(releaseFile));
		assert.ok(ACTIVE_START_STATES.has(blockerOne.status), JSON.stringify(blockerOne));
		assert.ok(ACTIVE_START_STATES.has(blockerTwo.status), JSON.stringify(blockerTwo));
		assert.equal(Scheduler.snapshot().active, 2);
		const queued = [];
		queued.push(await start(config, "owner-a", appendCommand(orderFile, "A1")));
		queued.push(await start(config, "owner-a", appendCommand(orderFile, "A2")));
		queued.push(await start(config, "owner-b", appendCommand(orderFile, "B1")));
		queued.push(await start(config, "owner-b", appendCommand(orderFile, "B2")));
		assert.ok(queued.every(result => result.status === "queued"));
		assert.equal(Scheduler.snapshot().active, 2);
		assert.equal(Scheduler.snapshot().queued, 4);
		fs.writeFileSync(releaseFile, "go\n");
		let maxObserved = 0;
		const all = [blockerOne, blockerTwo, ...queued];
		while (Scheduler.snapshot().active || Scheduler.snapshot().queued) {
			maxObserved = Math.max(maxObserved, Scheduler.snapshot().active);
			await delay(20);
		}
		for (const job of all) {
			const status = await Store.commandStatus(config, { action: "commandStatus", jobId: job.jobId });
			assert.equal(status.status, "completed", JSON.stringify(status));
		}
		const order = fs.readFileSync(orderFile, "utf8").trim().split(/\r?\n/);
		assert.deepEqual(new Set(order.slice(0, 2)), new Set(["A1", "B1"]));
		assert.deepEqual(new Set(order.slice(2)), new Set(["A2", "B2"]));
		assert.ok(maxObserved <= 2);
		assert.equal(Scheduler.snapshot().active, 0);
		assert.equal(Scheduler.snapshot().queued, 0);
		console.log(JSON.stringify({ ok: true, suite: "production-command-fairness", order, maxObserved }, null, 2));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

function start(config, ownerId, command) {
	return Store.startCommandJob(config, {
		action: "commandRun",
		requestAction: "commandRun",
		agentSessionId: ownerId,
		command,
		cwd: config.root,
		timeoutMs: 10000
	});
}

function waitCommand(file) {
	const script = `const fs=require('fs');const timer=setInterval(()=>{if(fs.existsSync(${JSON.stringify(file)})){clearInterval(timer)}},10)`;
	return `${JSON.stringify(process.execPath)} -e ${JSON.stringify(script)}`;
}

function appendCommand(file, label) {
	const script = `require('fs').appendFileSync(${JSON.stringify(file)},${JSON.stringify(`${label}\n`)});setTimeout(()=>{},80)`;
	return `${JSON.stringify(process.execPath)} -e ${JSON.stringify(script)}`;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
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
