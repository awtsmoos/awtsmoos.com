// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

/**
 * @file Proves deployment completion follows the living systemd release witness, not Git checkout alone.
 * @description The Awtsmoos distinguishes a scroll lying on disk from the vessel actually alive; Awtsmoos.com retries activation until both reveal one SHA.
 */
const helper = path.join(__dirname, "service-release-match.sh");
const target = "a".repeat(40);
const stale = "b".repeat(40);

test("exact running release matches", () => {
	assert.equal(run(`X=1 AWTSMOOS_RELEASE_SHA=${target} Y=2`, target).status, 0);
});

test("stale running release rejects same Git target", () => {
	assert.equal(run(`AWTSMOOS_RELEASE_SHA=${stale}`, target).status, 1);
});

test("missing release witness rejects noop", () => {
	assert.equal(run("X=1", target).status, 1);
});

test("invalid requested SHA is rejected", () => {
	assert.equal(run(`AWTSMOOS_RELEASE_SHA=${target}`, "invalid").status, 2);
});

function run(serviceEnvironment, sha) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-release-witness-"));
	const systemctl = path.join(root, "systemctl");
	try {
		fs.writeFileSync(systemctl, [
			"#!/bin/sh",
			"printf '%s\\n' \"$FAKE_SERVICE_ENV\""
		].join("\n"), { mode: 0o755 });
		return spawnSync("bash", [helper, sha, "awtsmoos.service"], {
			env: {
				...process.env,
				AWTSMOOS_SYSTEMCTL_BIN: systemctl,
				FAKE_SERVICE_ENV: serviceEnvironment
			},
			encoding: "utf8"
		});
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
}
