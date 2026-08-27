// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Index = require("../tools/chrome/index.js");
const LaunchModule = require("../tools/chrome/launch.js");
const { createChromeLaunch } = LaunchModule;
const Fakes = require("./helpers/chromeLaunchFakes.cjs");

/**
 * @file Proves Chrome launch terminalizes on CDP readiness instead of navigation readiness.
 * @description
 * The Awtsmoos gives launch one bounded witness and leaves page travel for another deed;
 * Awtsmoos.com proves routing, reuse, refusal, cleanup, and readiness without browser seed.
 */
test("public Chrome action routing uses the bounded launch module", () => {
	assert.equal(Index.ACTIONS.chromeLaunch, LaunchModule.chromeLaunch);
});

test("new Chrome launch resolves when CDP becomes ready without navigation", async () => {
	const fake = Fakes.create({ versionReadyAt: 3 });
	const launch = createChromeLaunch(fake.dependencies);
	const result = await launch({
		persist: false,
		startupTimeoutMs: 4000,
		startupWaitMs: 0,
		userDataDir: "/tmp/awtsmoos-launch-new"
	});

	assert.equal(result.ok, true);
	assert.equal(result.ready, true);
	assert.equal(result.pid, 4321);
	assert.equal(result.chromeTargetId, "page-1");
	assert.equal(fake.calls.spawn, 1);
	assert.equal(fake.calls.mark, 1);
	assert.equal(fake.calls.lease, 1);
	assert.equal(fake.calls.stop, 0);
});

test("owned existing Chrome is reused without spawning or navigation", async () => {
	const userDataDir = "/tmp/awtsmoos-launch-owned";
	const fake = Fakes.create({
		connected: true,
		records: [{ pid: 789, port: 9222, userDataDir }]
	});
	const launch = createChromeLaunch(fake.dependencies);
	const result = await launch({ persist: false, userDataDir });

	assert.equal(result.ok, true);
	assert.equal(result.reusedExisting, true);
	assert.equal(result.pid, 789);
	assert.equal(fake.calls.spawn, 0);
	assert.equal(fake.calls.newPage, 0);
});

test("unowned listening port is never claimed", async () => {
	const fake = Fakes.create({ connected: true });
	const launch = createChromeLaunch(fake.dependencies);
	const result = await launch({
		persist: false,
		userDataDir: "/tmp/awtsmoos-launch-unowned"
	});

	assert.equal(result.ok, false);
	assert.equal(result.error, "chrome_port_in_use_unowned");
	assert.equal(fake.calls.spawn, 0);
});

test("startup timeout cleans only the launched owned process", async () => {
	const fake = Fakes.create();
	const launch = createChromeLaunch(fake.dependencies);

	await assert.rejects(
		launch({
			launchAttempts: 1,
			persist: false,
			startupTimeoutMs: 2000,
			startupWaitMs: 0,
			userDataDir: "/tmp/awtsmoos-launch-timeout"
		}),
		error => error.code === "CHROME_CDP_STARTUP_TIMEOUT"
	);
	assert.equal(fake.calls.spawn, 1);
	assert.equal(fake.calls.stop, 1);
});
