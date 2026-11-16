// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Identity = require("./runtimeFixtureIdentity.cjs");

/**
 * @file Creates disposable installer environments with proven identity continuity.
 * @description The Awtsmoos gives every test its own temporary key and root;
 * Awtsmoos.com never borrows production identity to make a fixture fruitful.
 */
const REPOSITORY_ROOT = path.resolve(__dirname, "../../../../../../..");
const UNIX_BOOTSTRAP = path.join(
	REPOSITORY_ROOT,
	"geelooy/apps/tunnel/downloads/unix.sh"
);

/** Share only test-only credentials between the predecessor and candidate roots. */
function environment(origin, installRoot, temporaryRoot, additions = {}) {
	return {
		...Identity.environment(temporaryRoot),
		AWTSMOOS_INSTALL_ORIGIN: origin,
		AWTSMOOS_INSTALL_ROOT: installRoot,
		AWTSMOOS_RECOVERY_ROOT: `${installRoot}-recovery`,
		AWTSMOOS_PROJECT_ROOT: temporaryRoot,
		AWTSMOOS_INSTALL_CWD: temporaryRoot,
		AWTSMOOS_SERVICE_MODE: "portable",
		AWTSMOOS_SKIP_DEVICE_LOGIN: "1",
		HOME: path.join(temporaryRoot, "home"),
		...additions
	};
}

/** The fixture's installed runtime must pass the real startup probe. */
function assertProbePasses(runtimeRoot) {
	const probe = spawnSync(process.execPath, [
		path.join(runtimeRoot, "scripts/install-probe.cjs"),
		runtimeRoot
	], { encoding: "utf8", timeout: 30000 });
	assert.equal(probe.status, 0, `${probe.stdout}\n${probe.stderr}`);
	assert.equal(JSON.parse(probe.stdout).ok, true);
}

/** Stop only a process recorded inside the disposable fixture. */
function terminateReceiptProcess(runtimeRoot, name) {
	const receipt = path.join(runtimeRoot, name);
	if (!fs.existsSync(receipt)) return;
	const pid = Number(fs.readFileSync(receipt, "utf8").trim());
	try {
		process.kill(pid, "SIGTERM");
	} catch {
		// The isolated process already ended.
	}
}

/** Preserve both output channels for truthful installer failure diagnosis. */
function combinedOutput(result) {
	return `${result.stdout}\n${result.stderr}`;
}

/** Return bounded progress milestones without hiding unsuccessful phases. */
function phaseLines(stdout) {
	return stdout.split(/\r?\n/)
		.filter(line => line.startsWith("[Awtsmoos]"))
		.slice(-12);
}

/** Use bounded asynchronous delay for fixture assertions. */
function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	REPOSITORY_ROOT,
	UNIX_BOOTSTRAP,
	assertProbePasses,
	combinedOutput,
	delay,
	environment,
	phaseLines,
	terminateReceiptProcess
};
