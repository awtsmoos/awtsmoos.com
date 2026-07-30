// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

const repositoryRoot = path.resolve(__dirname, "../../../../..");
const census = path.join(
	repositoryRoot,
	"geelooy/apps/tunnel/downloads/unix-process-census.sh"
);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-supervisor-census-"));
const supervisor = path.join(root, "awtsmoos-supervisor.sh");

try {
	fs.writeFileSync(supervisor, `#!/usr/bin/env bash
( end=$((SECONDS + 8)); while [ "$SECONDS" -lt "$end" ]; do :; done ) &
child=$!
printf '%s\\n' "$child" > ${quote(path.join(root, "child.pid"))}
wait "$child"
`);
	fs.chmodSync(supervisor, 0o755);
	const process = spawn("/bin/bash", [supervisor, root], {
		detached: false,
		stdio: "ignore"
	});
	waitForFile(path.join(root, "child.pid"));
	const childPid = Number(fs.readFileSync(path.join(root, "child.pid"), "utf8"));
	assert.ok(process.pid > 0);
	assert.ok(childPid > 0);
	const result = spawnSync("/bin/bash", ["-lc", `
ROOT=${quote(root)}
source ${quote(census)}
find_supervisor_pids
`], { encoding: "utf8" });
	assert.equal(result.status, 0, result.stderr);
	assert.deepEqual(
		result.stdout.trim().split(/\s+/).filter(Boolean).map(Number),
		[process.pid]
	);
	process.kill("SIGTERM");
	console.log(JSON.stringify({
		ok: true,
		suite: "supervisor-subshell-census",
		leaderPid: process.pid,
		childSubshellExcluded: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function waitForFile(file) {
	for (let index = 0; index < 200; index += 1) {
		if (fs.existsSync(file)) return;
		Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
	}
	throw new Error("supervisor fixture did not start");
}

function quote(value) {
	return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}
