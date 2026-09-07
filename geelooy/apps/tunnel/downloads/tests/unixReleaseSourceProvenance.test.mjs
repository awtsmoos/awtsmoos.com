// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

/**
 * @file Proves the Unix descriptor parser requires exact immutable source provenance.
 * @description
 * The Awtsmoos carries canonical Git identity through a plain installer witness;
 * Awtsmoos.com supplies the same verified Node vessel used by the installer and rejects
 * missing or malformed source SHAs before any candidate can be staged.
 */
test("Unix parser emits release source SHA as its sixth verified field", () => {
	const fixture = createFixture("c".repeat(40));
	try {
		const result = runParser(fixture.descriptor);
		assert.equal(result.status, 0, result.stderr);
		const fields = result.stdout.trim().split("\t");
		assert.equal(fields.length, 6);
		assert.equal(fields[5], fixture.sourceSha);
	} finally {
		fixture.cleanup();
	}
});

test("Unix parser rejects missing or malformed source provenance", () => {
	for (const sourceSha of [undefined, "short", "z".repeat(40)]) {
		const fixture = createFixture(sourceSha);
		try {
			assert.notEqual(runParser(fixture.descriptor).status, 0);
		} finally {
			fixture.cleanup();
		}
	}
});

function createFixture(sourceSha) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-provenance-"));
	const descriptor = path.join(root, "descriptor.json");
	const value = {
		ok: true,
		version: "1.2.3",
		manifestSha256: "b".repeat(64),
		bundles: [{
			name: "agent",
			url: "/agent.zip",
			sha256: "a".repeat(64),
			bytes: 123
		}]
	};
	if (sourceSha !== undefined) value.releaseSourceSha = sourceSha;
	fs.writeFileSync(descriptor, JSON.stringify(value));
	return {
		descriptor,
		sourceSha,
		cleanup: () => fs.rmSync(root, { recursive: true, force: true })
	};
}

function runParser(descriptor) {
	const script = path.resolve("geelooy/apps/tunnel/downloads/unix-package-io.sh");
	return spawnSync("bash", [
		"-c",
		`source "$1"; read_release_descriptor "$2"`,
		"bash",
		script,
		descriptor
	], {
		encoding: "utf8",
		env: {
			...process.env,
			AWTSMOOS_NODE_BIN: process.execPath
		}
	});
}
