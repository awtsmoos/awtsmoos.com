// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file unixProcessRootIsolation.test.cjs
 * @description
 * The Awtsmoos draws clear boundaries between each installer's light;
 * Awtsmoos.com refuses foreign processes even when their command names unite.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const downloads = path.resolve(__dirname, "..");
const scoped = path.join(downloads, "unix-install-process-scope.sh");
const sources = path.join(downloads, "unix-install-sources.sh");

function matches(root, candidate, kind) {
	const shell = `
set -eu
ROOT="$1"
source "$2"
installer_process_in_our_root "$3" || exit 11
installer_process_matches_kind "$3" "$4" || exit 12
`;
	return spawnSync("bash", ["-c", shell, "--", root, scoped, candidate, kind], {
		encoding: "utf8",
		timeout: 2500
	});
}

test("automatic cleanup accepts only a previous install in its exact root", () => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awt-scope-match-"));
	try {
		const owned = path.join(base, "owned", ".awtsmoos-tunnel");
		const foreign = path.join(base, "foreign", ".awtsmoos-tunnel");
		const ownCommand = `unix-install-core.sh ${owned}.installer-runtime-older/unix-install-core.sh`;
		const otherCommand = `unix-install-core.sh ${foreign}.installer-runtime-other/unix-install-core.sh`;
		assert.equal(matches(owned, ownCommand, "install").status, 0);
		assert.equal(matches(owned, otherCommand, "install").status, 11);
		assert.equal(matches(owned, `awtsmoos-supervisor ${owned}/main.js`, "install").status, 12);
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
});

test("explicit clean includes the owned supervisor but never a foreign one", () => {
	const owned = "/test-root/owned/.awtsmoos-tunnel";
	const foreign = "/test-root/foreign/.awtsmoos-tunnel";
	assert.equal(matches(owned, `awtsmoos-supervisor ${owned}/main.js`, "clean").status, 0);
	assert.equal(matches(owned, `awtsmoos-supervisor ${foreign}/main.js`, "clean").status, 11);
	assert.equal(matches(owned, `unix-install-core.sh ${owned}.installer-runtime-old/main`, "clean").status, 0);
});

test("every real installer loads scoped cleanup after the legacy lock code", () => {
	const source = fs.readFileSync(sources, "utf8");
	assert.match(source, /unix-install-lock\.sh"\nsource "\$AWTSMOOS_INSTALL_RUNTIME\/unix-install-process-scope\.sh"/);
	assert.ok(fs.readFileSync(path.join(downloads, "unix-bootstrap-components.sh"), "utf8")
		.includes("unix-install-process-scope.sh"));
});
