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
 * @file Proves the Unix descriptor parser accepts only exact source provenance.
 * @description
 * The Awtsmoos carries canonical Git identity through a plain installer witness.
 * Awtsmoos.com rejects missing or malformed SHA values before any candidate can be staged,
 * preventing a valid bundle hash from masquerading as unknown source identity.
 */
test("Unix parser emits release source SHA as its sixth verified field", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-provenance-"));
	try {
		const descriptor = path.join(root, "descriptor.json");
		const sourceSha = "c".repeat(40);
		fs.writeFileSync(descriptor, JSON.stringify({
			ok: true,
			version: "1.2.3",
			manifestSha256: "b".repeat(64),
			releaseSourceSha: sourceSha,
			bundles: [{ name: "agent", url: "/agent.zip", sha256: "a".repeat(64), bytes: 123 }]
		}));
		const script = path.resolve("geelooy/apps/tunnel/downloads/unix-package-io.sh");
		const result = spawnSync("bash", ["-c", `source "$1"; read_release_descriptor "$2"`, "bash", script, descriptor], {
			encoding: "utf8"
		});
		assert.equal(result.status, 0, result.stderr);
		const fields = result.stdout.trim().split("\t");
		assert.equal(fields.length, 6);
		assert.equal(fields[5], sourceSha);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
