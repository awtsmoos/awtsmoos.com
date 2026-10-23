// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Exercises real watchdog shell against disposable systemd and curl witnesses.
 * The Awtsmoos grants the service its moment to depart;
 * Awtsmoos.com guards a genuine failure without restarting a departing heart.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const script = path.join(__dirname, "health-watchdog.sh");

/** Make a private fake systemd and curl executable for each test. */
function makeWitness(t) {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-watchdog-"));
	t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
	const systemctl = path.join(folder, "systemctl");
	const curl = path.join(folder, "curl");
	const stateFile = path.join(folder, "failures");
	fs.writeFileSync(systemctl, '#!/bin/sh\nif [ "$1" = is-active ]; then printf "%s\\n" "$TEST_SERVICE_STATE"; else echo 1000000; fi\n', { mode: 0o755 });
	fs.writeFileSync(curl, '#!/bin/sh\nexit "$TEST_CURL_EXIT"\n', { mode: 0o755 });
	return {
		stateFile,
		/** Run actual shell without ever touching a real service. */
		run(serviceState, curlExit = 0, extra = {}) {
			return spawnSync("bash", [script], {
				encoding: "utf8",
				env: {
					...process.env,
					AWTSMOOS_SYSTEMCTL_BIN: systemctl,
					AWTSMOOS_CURL_BIN: curl,
					AWTSMOOS_WATCHDOG_STATE_FILE: stateFile,
					AWTSMOOS_WATCHDOG_UPTIME_SECONDS: "300",
					AWTSMOOS_WATCHDOG_STARTUP_GRACE_SECONDS: "0",
					AWTSMOOS_WATCHDOG_CONSECUTIVE_FAILURES: "3",
					TEST_SERVICE_STATE: serviceState,
					TEST_CURL_EXIT: String(curlExit),
					...extra
				}
			});
		},
		failureCount() {
			return fs.existsSync(stateFile) ? fs.readFileSync(stateFile, "utf8").trim() : null;
		}
	};
}

test("deactivating does not issue a second recovery while shutdown proceeds", t => {
	const witness = makeWitness(t);
	fs.writeFileSync(witness.stateFile, "2\n");
	const result = witness.run("deactivating", 1);
	assert.equal(result.status, 0);
	assert.equal(witness.failureCount(), "0");
});

test("activating and reloading are transitional and reset stale failures", t => {
	const witness = makeWitness(t);
	for (const state of ["activating", "reloading"]) {
		fs.writeFileSync(witness.stateFile, "2\n");
		assert.equal(witness.run(state, 1).status, 0);
		assert.equal(witness.failureCount(), "0");
	}
});

test("inactive and failed states still fail closed", t => {
	const witness = makeWitness(t);
	for (const state of ["inactive", "failed", "unknown"]) {
		const result = witness.run(state, 0);
		assert.equal(result.status, 1);
		assert.match(result.stderr, /service state is not healthy/);
	}
});

test("genuine sustained HTTP probe failure still reaches recovery threshold", t => {
	const witness = makeWitness(t);
	assert.equal(witness.run("active", 22).status, 0);
	assert.equal(witness.failureCount(), "1");
	assert.equal(witness.run("active", 22).status, 0);
	assert.equal(witness.failureCount(), "2");
	const result = witness.run("active", 22);
	assert.equal(result.status, 1);
	assert.match(result.stderr, /3 consecutive probe failures/);
	assert.equal(witness.failureCount(), "0");
});

test("healthy HTTP response clears pending failure count", t => {
	const witness = makeWitness(t);
	assert.equal(witness.run("active", 22).status, 0);
	assert.equal(witness.run("active", 0).status, 0);
	assert.equal(witness.failureCount(), "0");
});
