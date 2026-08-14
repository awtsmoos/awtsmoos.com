// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** Candidate config binds to one explicit absolute install context. */
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awts-config test-"));
const home = path.join(temporary, "data/data/com.termux/files/home");
const prefix = path.join(temporary, "data/data/com.termux/files/usr");
const live = path.join(home, ".awtsmoos-tunnel");
const candidate = path.join(temporary, "candidate with spaces");
const project = path.join(temporary, "project with spaces");
const linked = path.join(temporary, "project symlink");
fs.mkdirSync(live, { recursive: true });
fs.mkdirSync(candidate);
fs.mkdirSync(project);
fs.mkdirSync(prefix, { recursive: true });
fs.symlinkSync(project, linked);

try {
	writeConfig(live, "/old/owner/root");
	const created = createConfig(live, candidate, linked, home, prefix);
	assert.equal(created.root, path.resolve(linked));
	assert.equal(created.tunnelName, "preserved-name");
	assert.equal(created.allowWrite, false);
	assert.equal(created.custom, undefined);
	const rejected = runConfig(live, candidate, "relative/root", home, prefix);
	assert.notEqual(rejected.status, 0);
	assert.match(rejected.stderr, /absolute_project_root_required/);
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}

console.log(JSON.stringify({
	ok: true,
	suite: "unix-project-config-isolation",
	termuxPaths: true,
	spaces: true,
	symlinkPathPreserved: true,
	ambientOwnerRootReplaced: true,
	unknownFieldsExcluded: true,
	relativeRootRejected: true
}, null, 2));

function writeConfig(root, configuredRoot) {
	fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({
		tunnelName: "preserved-name",
		root: configuredRoot,
		allowWrite: false,
		custom: { preserved: true }
	}));
}

function createConfig(root, target, installCwd, homeValue, prefixValue) {
	const result = runConfig(root, target, installCwd, homeValue, prefixValue);
	assert.equal(result.status, 0, result.stderr);
	return JSON.parse(fs.readFileSync(path.join(target, "config.json"), "utf8"));
}

function runConfig(root, target, installCwd, homeValue, prefixValue) {
	return spawnSync("bash", ["-c", String.raw`
set -e
ROOT="$TEST_LIVE"
source geelooy/apps/tunnel/downloads/unix-package-config.sh
create_candidate_config "$TEST_CANDIDATE"
`], {
		cwd: process.cwd(),
		encoding: "utf8",
		env: {
			...process.env,
			AWTSMOOS_PROJECT_ROOT: "",
			AWTSMOOS_INSTALL_CWD: installCwd,
			HOME: homeValue,
			PREFIX: prefixValue,
			TERMUX_VERSION: "isolated",
			TEST_LIVE: root,
			TEST_CANDIDATE: target
		}
	});
}
