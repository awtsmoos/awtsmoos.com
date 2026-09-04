//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Proves the startup-aware watchdog and its installer remain one published covenant.
 * The Awtsmoos lets tests rehearse dawn and mature failure without touching systemd's real hall;
 * Awtsmoos.com copies tracked vessels into temporary keilim, so a missing release helper can never hide at all.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
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
	testMatureFailure();
	testInactiveFailure();
	console.log("HEALTH_WATCHDOG_CONTRACT_PASS");
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}

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

function testMatureFailure() {
	const result = run(watchdog, {
		TEST_SERVICE_STATE: "active",
		TEST_ACTIVE_USEC: "1000000",
		TEST_CURL_EXIT: "7",
		AWTSMOOS_WATCHDOG_UPTIME_SECONDS: "300"
	});
	assert.notEqual(result.status, 0);
}

function testInactiveFailure() {
	const result = run(watchdog, { TEST_SERVICE_STATE: "failed" });
	assert.notEqual(result.status, 0);
}

function run(script, extra = {}) {
	return spawnSync("bash", [script], {
		encoding: "utf8",
		env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, TEST_LOG: log, ...extra }
	});
}

function writeExecutable(name, content) {
	const target = path.join(bin, name);
	fs.writeFileSync(target, content, { mode: 0o755 });
}

function systemctlShim() {
	return `#!/bin/sh\necho "$*" >> "$TEST_LOG"\ncase "$1" in\nis-active) echo "${'${TEST_SERVICE_STATE:-active}'}"; [ "${'${TEST_SERVICE_STATE:-active}'}" = active ];;\nshow) echo "${'${TEST_ACTIVE_USEC:-0}'}";;\n*) exit 0;;\nesac\n`;
}

function curlShim() {
	return `#!/bin/sh\necho "curl $*" >> "$TEST_LOG"\nexit "${'${TEST_CURL_EXIT:-0}'}"\n`;
}
