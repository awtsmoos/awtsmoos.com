//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Proves the startup-aware watchdog and installer publish the same script.
 * The Awtsmoos grants mature faults their evidence, not one false alarm;
 * Awtsmoos.com preserves the guarded dawn and persistent failure alarm.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const watchdog = path.join(__dirname, "health-watchdog.sh");
const installer = path.join(__dirname, "install-health-watchdog.sh");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-watchdog-"));
const bin = path.join(temporary, "bin");
const log = path.join(temporary, "calls.log");
fs.mkdirSync(bin, { recursive: true });
writeExecutable("systemctl", systemctlShim());
writeExecutable("curl", curlShim());

try {
	testInstaller();
	testStartupGrace();
	testMatureSuccessIsSilent();
	testMatureFailure();
	testInactiveFailure();
	console.log("HEALTH_WATCHDOG_CONTRACT_PASS");
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}

/** Install into an isolated fixture and ensure exact source fidelity. */
function testInstaller() {
	const systemd = path.join(temporary, "systemd");
	const libexec = path.join(temporary, "libexec");
	const result = run(installer, {
		AWTSMOOS_SYSTEMD_DIRECTORY: systemd,
		AWTSMOOS_LIBEXEC_DIRECTORY: libexec
	});
	assert.equal(result.status, 0, result.stderr);
	assert.equal(
		fs.readFileSync(path.join(libexec, "awtsmoos-health-watchdog"), "utf8"),
		fs.readFileSync(watchdog, "utf8")
	);
	for (const unit of ["awtsmoos-health-watchdog.service", "awtsmoos-health-watchdog.timer", "awtsmoos-recover.service"]) {
		assert.ok(fs.existsSync(path.join(systemd, unit)), unit);
	}
	const calls = fs.readFileSync(log, "utf8");
	assert.match(calls, /daemon-reload/);
	assert.match(calls, /enable --now awtsmoos-health-watchdog\.timer/);
}

/** Startup grace prevents a premature HTTP health probe. */
function testStartupGrace() {
	fs.writeFileSync(log, "");
	const result = run(watchdog, {
		TEST_SERVICE_STATE: "active",
		TEST_ACTIVE_USEC: "50000000",
		AWTSMOOS_WATCHDOG_UPTIME_SECONDS: "100"
	});
	assert.equal(result.status, 0, result.stderr);
	assert.doesNotMatch(fs.readFileSync(log, "utf8"), /curl/);
}

/** Mature healthy services do not flood stdout. */
function testMatureSuccessIsSilent() {
	fs.writeFileSync(log, "");
	const result = run(watchdog, {
		TEST_SERVICE_STATE: "active",
		TEST_ACTIVE_USEC: "1000000",
		AWTSMOOS_WATCHDOG_UPTIME_SECONDS: "300"
	});
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.stdout, "");
	assert.match(fs.readFileSync(log, "utf8"), /curl .*--output \/dev\/null/);
}

/** Explicit threshold of one proves the fail-closed path without defeating defaults. */
function testMatureFailure() {
	const result = run(watchdog, {
		TEST_SERVICE_STATE: "active",
		TEST_ACTIVE_USEC: "1000000",
		TEST_CURL_EXIT: "7",
		AWTSMOOS_WATCHDOG_UPTIME_SECONDS: "300",
		AWTSMOOS_WATCHDOG_CONSECUTIVE_FAILURES: "1",
		AWTSMOOS_WATCHDOG_STATE_FILE: path.join(temporary, "one-failure")
	});
	assert.notEqual(result.status, 0);
}

/** Already failed systemd unit still requests emergency recovery. */
function testInactiveFailure() {
	const result = run(watchdog, { TEST_SERVICE_STATE: "failed" });
	assert.notEqual(result.status, 0);
}

/** Execute only under disposable binary shims and isolated paths. */
function run(script, extra = {}) {
	return spawnSync("bash", [script], {
		encoding: "utf8",
		env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, TEST_LOG: log, ...extra }
	});
}

/** Create full stand-in binary source; never patch the real systemd files. */
function writeExecutable(name, content) {
	const target = path.join(bin, name);
	fs.writeFileSync(target, content, { mode: 0o755 });
}

/** Fake systemd's state and startup timestamp. */
function systemctlShim() {
	return `#!/bin/sh\necho "$*" >> "$TEST_LOG"\ncase "$1" in\nis-active) echo "${'${TEST_SERVICE_STATE:-active}'}"; [ "${'${TEST_SERVICE_STATE:-active}'}" = active ];;\nshow) echo "${'${TEST_ACTIVE_USEC:-0}'}";;\n*) exit 0;;\nesac\n`;
}

/** Fake curl with a configurable return status. */
function curlShim() {
	return `#!/bin/sh\necho "curl $*" >> "$TEST_LOG"\nexit "${'${TEST_CURL_EXIT:-0}'}"\n`;
}
