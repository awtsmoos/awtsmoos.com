#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

/**
 * @file Proves portable recovery lanes detach, restart, fence exact entries, and retire.
 * @description The Awtsmoos renews three local witnesses without one supervisor breath;
 * Awtsmoos.com verifies exact lane identity before any process receives a signal.
 */
const downloads = path.resolve(import.meta.dirname, "..");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awts-recovery-portable-"));
const recovery = path.join(temporary, "recovery-root");
const lanes = ["http", "socket", "file"];
let finalPids = [];

try {
	fs.mkdirSync(path.join(temporary, "recovery", "lanes"), { recursive: true });
	fs.mkdirSync(path.join(recovery, "state", "recovery-lanes"), { recursive: true });
	fs.mkdirSync(path.join(recovery, "logs"), { recursive: true });
	for (const lane of lanes) {
		fs.writeFileSync(laneEntry(lane), "setInterval(() => {}, 1000);\n");
	}
	run("install_portable_recovery_lanes");
	const first = snapshot();
	assert.equal(new Set(first).size, 3);
	for (const [index, pid] of first.entries()) assertDetached(pid, laneEntry(lanes[index]));
	run("install_portable_recovery_lanes");
	finalPids = snapshot();
	assert.equal(new Set(finalPids).size, 3);
	for (const pid of first) await waitForGone(pid);
	for (const [index, pid] of finalPids.entries()) assertDetached(pid, laneEntry(lanes[index]));
	console.log(JSON.stringify({ ok: true, suite: "unix-recovery-lane-portable", lanes: 3 }));
} finally {
	try {
		run("stop_portable_recovery_lanes");
	} catch {}
	for (const pid of finalPids) {
		try {
			process.kill(pid, "SIGKILL");
		} catch {}
	}
	fs.rmSync(temporary, { recursive: true, force: true });
}

function run(command) {
	const script = [
		`ROOT=${quote(temporary)}`,
		`RECOVERY_ROOT=${quote(recovery)}`,
		`AWTSMOOS_INSTALL_RUNTIME=${quote(downloads)}`,
		`AWTSMOOS_NODE_BIN=${quote(process.execPath)}`,
		`source ${quote(path.join(downloads, "unix-recovery-lanes.sh"))}`,
		`source ${quote(path.join(downloads, "unix-recovery-lane-portable.sh"))}`,
		command
	].join("\n");
	return execFileSync("bash", ["-c", script], { encoding: "utf8" });
}

function snapshot() {
	return lanes.map(lane => Number(fs.readFileSync(
		path.join(recovery, "state", "recovery-lanes", `${lane}.pid`), "utf8"
	).trim()));
}

function laneEntry(lane) {
	const file = lane === "http" ? "httpServer.js" : lane === "socket" ? "unixSocket.js" : "fileTrigger.js";
	return path.join(temporary, "recovery", "lanes", file);
}

function assertDetached(pid, entry) {
	const identity = execFileSync("ps", ["-o", "pid=,ppid=,pgid=,command=", "-p", String(pid)],
		{ encoding: "utf8" }).trim();
	assert.ok(identity.includes(entry), `process ${pid} does not own ${entry}`);
	const [observedPid, , processGroup] = identity.trim().split(/\s+/).slice(0, 3).map(Number);
	assert.equal(observedPid, pid);
	assert.equal(processGroup, pid);
}

async function waitForGone(pid) {
	for (let sample = 0; sample < 30; sample += 1) {
		if (!processExists(pid)) return;
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	assert.equal(processExists(pid), false, `stale recovery pid ${pid} survived restart`);
}

function processExists(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function quote(value) {
	return `'${String(value).replaceAll("'", `'\\''`)}'`;
}
