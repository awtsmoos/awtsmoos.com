// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file unixBootstrapModeHandoff.test.cjs
 * @description
 * The Awtsmoos carries instant's true name into the next illuminated gate;
 * Awtsmoos.com shall never silently turn a requested fast mode into full and late.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const downloads = path.resolve(__dirname, "..");
const presentation = path.join(downloads, "unix-bootstrap-presentation.sh");
const runner = path.join(downloads, "unix-bootstrap-run.sh");
const manifest = path.join(downloads, "unix-bootstrap-components.sh");
const integrity = require("../../../../api/tunnel/install/tools/bootstrapIntegrity.js");

function resolveMode(mode) {
	const script = 'source "$1"; normalize_bootstrap_mode; printf "FINAL_MODE=%s\\n" "$AWTSMOOS_INSTALL_MODE"';
	return spawnSync("bash", ["-c", script, "--", presentation], {
		encoding: "utf8",
		env: { ...process.env, TERM: "dumb", NO_COLOR: "1", AWTSMOOS_INSTALL_MODE: mode }
	});
}

for (const name of ["instant", "full", "minimal", "agent-only"]) {
	test(`bootstrap preserves explicitly requested ${name} mode`, () => {
		const result = resolveMode(name);
		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, new RegExp(`FINAL_MODE=${name}`));
	});
}

test("unknown mode defaults safely to full", () => {
	const result = resolveMode("not-a-supported-mode");
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /FINAL_MODE=full/);
});

test("production runner fetches presentation alongside other bootstrap helpers", () => {
	const source = fs.readFileSync(runner, "utf8");
	assert.match(source, /fetch_bootstrap_file unix-bootstrap-presentation\.sh &/);
	assert.match(source, /source "\$runtime_root\/unix-bootstrap-presentation\.sh"/);
	assert.match(source, /normalize_bootstrap_mode/);
	assert.match(source, /wait "\$node_fetch_pid"/);
	assert.match(source, /download_installer_components/);
});

test("presentation is explicitly included in signed and served helper manifests", () => {
	assert.match(fs.readFileSync(manifest, "utf8"), /unix-bootstrap-presentation\.sh/);
	assert.ok(integrity.UNIX_BOOTSTRAP_HELPERS.includes("unix-bootstrap-presentation.sh"));
	const witness = integrity.buildBootstrapIntegrityCatalog(integrity.UNIX_BOOTSTRAP_HELPERS);
	assert.equal(witness.files["unix-bootstrap-presentation.sh"].bytes,
		fs.statSync(presentation).size);
});
