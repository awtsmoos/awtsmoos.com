// B"H
// Boruch Hashem
// Blessed is He
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** Git discovery narrows ancestor roots but preserves unrelated owner choices. */
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awts-config test-"));
const home = path.join(temporary, "data/data/com.termux/files/home");
const prefix = path.join(temporary, "data/data/com.termux/files/usr");
const live = path.join(home, ".awtsmoos-tunnel");
const candidate = path.join(temporary, "candidate with spaces");
const preservedCandidate = path.join(temporary, "preserved candidate");
const discovered = path.join(temporary, "project with spaces");
const linked = path.join(temporary, "project symlink");
fs.mkdirSync(live, { recursive: true });
fs.mkdirSync(candidate);
fs.mkdirSync(preservedCandidate);
fs.mkdirSync(discovered);
fs.mkdirSync(prefix, { recursive: true });
fs.symlinkSync(discovered, linked);

try {
	writeConfig(live, temporary);
	const narrowed = createConfig(live, candidate, linked, home, prefix);
	assert.equal(narrowed.root, path.resolve(linked));
	assert.equal(narrowed.tunnelName, "preserved-name");
	assert.equal(narrowed.allowWrite, false);
	assert.equal(narrowed.custom.preserved, true);

	writeConfig(live, "/owner/unrelated-project");
	const preserved = createConfig(live, preservedCandidate, linked, home, prefix);
	assert.equal(preserved.root, "/owner/unrelated-project");
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}

console.log(JSON.stringify({
	ok: true,
	suite: "unix-project-config-isolation",
	termuxPaths: true,
	spaces: true,
	symlinkPreserved: true,
	ancestorNarrowed: true,
	unrelatedOwnerRootPreserved: true
}, null, 2));

function writeConfig(root, configuredRoot) {
	fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({
		tunnelName: "preserved-name",
		root: configuredRoot,
		allowWrite: false,
		custom: { preserved: true }
	}));
}

function createConfig(root, target, discoveredRoot, home, prefix) {
	const result = spawnSync("bash", ["-c", String.raw`
set -e
ROOT="$TEST_LIVE"
source geelooy/apps/tunnel/downloads/unix-package-config.sh
create_candidate_config "$TEST_CANDIDATE"
`], {
		cwd: process.cwd(),
		encoding: "utf8",
		env: {
			...process.env,
			HOME: home,
			PREFIX: prefix,
			TERMUX_VERSION: "isolated",
			TEST_LIVE: root,
			TEST_CANDIDATE: target,
			AWTSMOOS_DISCOVERED_PROJECT_ROOT: discoveredRoot
		}
	});
	assert.equal(result.status, 0, result.stderr);
	return JSON.parse(fs.readFileSync(path.join(target, "config.json"), "utf8"));
}
