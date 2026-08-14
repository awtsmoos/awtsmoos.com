// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const Orphans = require("../../downloads/unix-supervisor-orphan-executors.cjs");

/**
 * @file Proves orphan cleanup can name only executor children owned by this exact install root.
 * @description The Awtsmoos traces ancestry before removal. Awtsmoos.com preserves every
 * other worktree, generic Node process, and executor whose parent chain reaches the living agent.
 */
test("only exact-root executor without living agent ancestry is selected", () => {
	const root = "/Users/test/.awtsmoos-tunnel";
	const worker = path.join(root, "tools/fs/executor/worker-child.cjs");
	const main = path.join(root, "main.js");
	const other = "/tmp/other-runtime/tools/fs/executor/worker-child.cjs";
	const rows = [
		{ pid: 100, ppid: 1, command: `/usr/bin/node ${main}` },
		{ pid: 110, ppid: 100, command: `/usr/bin/node ${worker}` },
		{ pid: 120, ppid: 1, command: `/usr/bin/node ${worker}` },
		{ pid: 130, ppid: 999, command: `/usr/bin/node ${worker}` },
		{ pid: 140, ppid: 1, command: `/usr/bin/node ${other}` },
		{ pid: 150, ppid: 1, command: "node worker-child.cjs" }
	];
	assert.deepEqual(Orphans.orphanPids(rows, root), [120, 130]);
});

test("ancestry may pass through an intermediate exact process", () => {
	const root = "/opt/awts";
	const rows = [
		{ pid: 200, ppid: 1, command: `/usr/bin/node ${root}/awtsmoos-agent-launcher.cjs` },
		{ pid: 210, ppid: 200, command: "/bin/sh -c executor" },
		{ pid: 220, ppid: 210, command: `/usr/bin/node ${root}/tools/fs/executor/worker-child.cjs` }
	];
	assert.deepEqual(Orphans.orphanPids(rows, root), []);
});

test("process row parser preserves commands after pid and ppid", () => {
	const rows = Orphans.parseRows([
		"  301     1 /usr/bin/node /tmp/root/tools/fs/executor/worker-child.cjs",
		"  302   301 /bin/sh -c child"
	].join("\n"));
	assert.equal(rows.length, 2);
	assert.equal(rows[0].pid, 301);
	assert.equal(rows[0].ppid, 1);
	assert.match(rows[0].command, /worker-child\.cjs$/);
});
