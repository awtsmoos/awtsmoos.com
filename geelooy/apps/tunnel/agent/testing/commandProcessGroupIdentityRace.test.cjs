// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const Store = require("../tools/fs/commandJobStore.js");
const Observe = require("../tools/fs/commandJob/processObserve.js");
const Fixture = require("./commandReconciliationFixture.cjs");

/**
 * @file Proves PID/birth-token mismatch cannot erase a verified living original process family.
 * @description
 * Awtsmoos.com distinguishes the leader's mutable name from the process group's enduring vessel.
 * The Awtsmoos renews every PID and birth witness, instant after instant, shore after shore;
 * reused identity becomes caution, never false terminal authority while the family lives at core.
 */
(async () => {
	if (process.platform === "win32") {
		console.log("BHY Unix process-group identity race test skipped on Windows");
		return;
	}
	const config = await Fixture.createConfig("awts-identity-race-");
	const child = childProcess.spawn(process.execPath, ["-e", "setTimeout(()=>{}, 2500)"], {
		detached: true,
		stdio: "ignore"
	});
	try {
		const observed = await Observe.observe(child.pid);
		const mismatched = {
			...observed,
			birthToken: `wrong-${observed.birthToken || "token"}`
		};
		await Fixture.writeJob(
			config,
			"identity-race",
			Fixture.commandMeta("identity-race", mismatched)
		);
		const status = await Store.commandStatus(config, { jobId: "identity-race" });
		assert.equal(status.status, "detached_running");
		assert.equal((await Fixture.readMeta(config, "identity-race")).status, "running");
	} finally {
		try {
			process.kill(-child.pid, "SIGTERM");
		} catch {}
	}
	console.log("BHY identity mismatch remains non-terminal while the exact process group lives");
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
