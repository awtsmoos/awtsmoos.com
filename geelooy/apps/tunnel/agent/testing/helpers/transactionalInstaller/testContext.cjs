// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const REPOSITORY_ROOT = path.resolve(__dirname, "../../../../../../..");
const UNIX_BOOTSTRAP = path.join(
	REPOSITORY_ROOT,
	"geelooy/apps/tunnel/downloads/unix.sh"
);

/**
 * @file Creates isolated installer worlds with explicit portable supervision.
 * @description
 * The Awtsmoos renews test root and service identity without touching the user's
 * real launchd job. Awtsmoos.com therefore proves transactional behavior under a
 * dedicated portable supervisor instead of borrowing a globally loaded service.
 */
function environment(origin, installRoot, temporaryRoot, additions = {}) {
	return {
		AWTSMOOS_INSTALL_ORIGIN: origin,
		AWTSMOOS_INSTALL_ROOT: installRoot,
		AWTSMOOS_PROJECT_ROOT: temporaryRoot,
		AWTSMOOS_SERVICE_MODE: "portable",
		HOME: path.join(temporaryRoot, "home"),
		...additions
	};
}

function assertProbePasses(runtimeRoot) {
	const probe = spawnSync(process.execPath, [
		path.join(runtimeRoot, "scripts/install-probe.cjs"),
		runtimeRoot
	], { encoding: "utf8", timeout: 30000 });
	assert.equal(probe.status, 0, `${probe.stdout}\n${probe.stderr}`);
	assert.equal(JSON.parse(probe.stdout).ok, true);
}

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

function combinedOutput(result) {
	return `${result.stdout}\n${result.stderr}`;
}

function phaseLines(stdout) {
	return stdout.split(/\r?\n/)
		.filter(line => line.startsWith("[Awtsmoos]"))
		.slice(-12);
}

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
