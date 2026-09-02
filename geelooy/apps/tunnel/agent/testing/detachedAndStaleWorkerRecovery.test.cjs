// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const Store = require("../tools/fs/commandJobStore.js");
const Observe = require("../tools/fs/commandJob/processObserve.js");
const Fixture = require("./commandReconciliationFixture.cjs");

/**
 * @file Proves leader death cannot erase a still-living detached command family.
 * @description
 * Awtsmoos.com watches the whole process vessel, not one fading PID. The Awtsmoos
 * renews leader and descendants from nothing, instant after instant, shore after shore;
 * only verified family absence may become stale_lost_worker and close the durable door.
 */
(async () => {
	const config = await Fixture.createConfig("awts-detached-truth-");
	const leader = childProcess.spawn(process.execPath, ["-e", "setTimeout(()=>{}, 3000)"], {
		stdio: "ignore"
	});
	try {
		await proveLivingLeader(config, leader);
		if (process.platform !== "win32") {
			await proveSurvivingGroup(config);
		}
		await proveDeadFamily(config);
	} finally {
		try {
			leader.kill("SIGTERM");
		} catch {}
	}
	console.log("BHY detached reconciliation follows verified process-family truth");
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});

/** Proves an exact living leader remains detached-running and non-terminal. */
async function proveLivingLeader(config, leader) {
	const liveIdentity = await Observe.observe(leader.pid);
	await Fixture.writeJob(config, "live-leader", Fixture.commandMeta("live-leader", liveIdentity));
	const liveStatus = await Store.commandStatus(config, { jobId: "live-leader" });
	assert.equal(liveStatus.status, "detached_running");
}

/** Creates a leader that exits while a descendant remains in the original Unix process group. */
async function proveSurvivingGroup(config) {
	const shell = childProcess.spawn("/bin/sh", ["-c", "sleep 3 & sleep 0.4"], {
		detached: true,
		stdio: "ignore"
	});
	const original = await Observe.observe(shell.pid);
	await Fixture.writeJob(config, "living-group", Fixture.commandMeta("living-group", original));
	await Fixture.onceExit(shell);
	const during = await Store.commandStatus(config, { jobId: "living-group" });
	assert.equal(during.status, "detached_running");
	assert.equal((await Fixture.readMeta(config, "living-group")).status, "running");
	await Fixture.delay(3000);
	const after = await Store.commandStatus(config, { jobId: "living-group" });
	assert.equal(after.status, "stale_lost_worker");
}

/** Proves verified family absence remains terminal stale-lost-worker testimony. */
async function proveDeadFamily(config) {
	const deadIdentity = Fixture.identity(99999991, "synthetic-dead-token");
	await Fixture.writeJob(config, "dead-family", Fixture.commandMeta("dead-family", deadIdentity));
	const deadStatus = await Store.commandStatus(config, { jobId: "dead-family" });
	assert.equal(deadStatus.status, "stale_lost_worker");
	assert.equal(deadStatus.receipt.state, "stale_lost_worker");
	assert.equal(deadStatus.worker.detached, true);
}
