#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const downloads = path.resolve(import.meta.dirname, "..");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awts-portable-detach-"));
const supervisor = path.join(temporary, "awtsmoos-supervisor.sh");
const pidFile = path.join(temporary, "supervisor.pid");
let pid = 0;

try {
	fs.writeFileSync(supervisor, [
		"#!/usr/bin/env bash",
		"printf '%s\\n' \"$$\" > \"$1/supervisor.pid\"",
		"trap 'exit 0' TERM INT",
		"while true; do sleep 1; done"
	].join("\n"));
	fs.chmodSync(supervisor, 0o755);
	execFileSync("bash", ["-c", [
		`ROOT=${quote(temporary)}`,
		`AWTSMOOS_INSTALL_RUNTIME=${quote(downloads)}`,
		`AWTSMOOS_NODE_BIN=${quote(process.execPath)}`,
		`source ${quote(path.join(downloads, "unix-process-control.sh"))}`,
		"start_detached_portable_supervisor"
	].join("\n")], { stdio: "ignore" });
	for (let attempt = 0; attempt < 30 && !fs.existsSync(pidFile); attempt += 1) {
		execFileSync("sleep", ["0.1"]);
	}
	pid = Number(fs.readFileSync(pidFile, "utf8").trim());
	process.kill(pid, 0);
	const identity = execFileSync(
		"ps",
		["-o", "pid=,ppid=,pgid=", "-p", String(pid)],
		{ encoding: "utf8" }
	).trim().split(/\s+/).map(Number);
	assert.equal(identity[0], pid);
	assert.equal(identity[1], 1);
	assert.equal(identity[2], pid);
	console.log(JSON.stringify({
		ok: true,
		suite: "unix-portable-detach-isolation",
		detachedProcessGroup: true,
		reparentedToInit: true
	}, null, 2));
} finally {
	if (pid) {
		try { process.kill(pid, "SIGTERM"); } catch {}
	}
	fs.rmSync(temporary, { recursive: true, force: true });
}

function quote(value) {
	return `'${String(value).replaceAll("'", `'\\''`)}'`;
}
