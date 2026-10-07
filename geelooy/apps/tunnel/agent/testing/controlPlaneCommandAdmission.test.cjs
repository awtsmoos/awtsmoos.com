// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file controlPlaneCommandAdmission.test.cjs
 * @description Proves command safety and the bounded synchronous fast-path policy.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const Start = require("../tools/fs/commandJob/start.js");
const Sync = require("../tools/fs/actionGroups/commandActionSync.js");
const Legacy = require("../tools/command/run.js");
const { CODE } = require("../tools/fs/commandSafety/admission.js");

const INCIDENT = `node scripts/bh.mjs --command "systemctl stop awtsmoos-health-watchdog.timer && systemctl disable awtsmoos-health-watchdog.timer; systemctl stop awtsmoos && sleep 10"`;

const ASYNC_CONFIG = Object.freeze({ allowCommands: true });
const LEGACY_CONFIG = Object.freeze({
	allowCommands: true,
	root: process.cwd(),
	tools: { command: true },
	command: { enabled: true, defaultShell: "bash", timeoutMs: 30000 }
});

test("async command start rejects before job identity exists", async () => {
	const result = await Start.startCommandJob(ASYNC_CONFIG, {
		command: INCIDENT,
		requestAction: "commandRun"
	});
	assert.equal(result.ok, false);
	assert.equal(result.code, CODE);
	assert.equal(result.jobId, undefined);
	assert.ok(result.rules.includes("main_service_shutdown"));
	assert.ok(result.rules.includes("recovery_path_shutdown"));
});

test("synchronous public runner rejects before subprocess execution", async () => {
	const result = await Sync.runCommand(ASYNC_CONFIG, {
		command: INCIDENT,
		sync: true
	}, "shellCommand");
	assert.equal(result.ok, false);
	assert.equal(result.code, CODE);
	assert.equal(result.mode, undefined);
	assert.equal(result.exitCode, undefined);
});

test("legacy inline runner rejects before shell execution", async () => {
	const result = await Legacy.runCommand(LEGACY_CONFIG, {
		command: INCIDENT,
		sync: true
	});
	assert.equal(result.ok, false);
	assert.equal(result.code, CODE);
	assert.equal(result.exitCode, undefined);
});

test("safe atomic restart remains admitted by async validation", () => {
	const result = Start.validate(ASYNC_CONFIG, {
		requestAction: "commandRun"
	}, "systemctl restart awtsmoos.service");
	assert.equal(result, null);
});

test("ordinary bounded command defaults to synchronous fast path", () => {
	assert.equal(Sync.shouldRunSync({ command: "echo hello" }), true);
});

test("explicit async and durable commands stay on durable path", () => {
	assert.equal(Sync.shouldRunSync({ command: "echo hello", async: true }), false);
	assert.equal(Sync.shouldRunSync({ command: "echo hello", durable: true }), false);
});

test("async false and syncExec explicitly select synchronous path", () => {
	assert.equal(Sync.shouldRunSync({ command: "echo hello", async: false }), true);
	assert.equal(Sync.shouldRunSync({ command: "echo hello", syncExec: true }), true);
});

test("oversized and long-timeout commands stay on durable path", () => {
	assert.equal(Sync.shouldRunSync({ command: "x".repeat(8001) }), false);
	assert.equal(Sync.shouldRunSync({ command: "echo hello", timeoutMs: 30001 }), false);
});
