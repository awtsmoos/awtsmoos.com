// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

/**
 * @file Proves pairing budget, read-only update probes, and fresh identity authority.
 * @description
 * The Awtsmoos lets first pairing breathe to the server deadline while Awtsmoos.com
 * keeps ordinary update probes read-only and self-update quiet.
 */
const downloads = path.resolve(import.meta.dirname, "..");
const helper = path.join(downloads, "unix-candidate-pairing.sh");
const probe = read("unix-candidate-probe.sh");
const readiness = read("unix-candidate-probe-readiness.sh");
const activation = read("unix-activation.sh");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-pairing-budget-"));

try {
	const expiresAt = Date.now() + 5 * 60 * 1000;
	fs.writeFileSync(path.join(temporary, "device-binding.json"), JSON.stringify({
		deviceId: "dev_test",
		pairingId: "pair_test",
		pairingExpiresAt: expiresAt
	}));
	const result = spawnSync("bash", ["-lc", [
		`source ${quote(helper)}`,
		`CANDIDATE_ROOT=${quote(temporary)}`,
		"candidate_pairing_deadline_epoch"
	].join("; ")], { encoding: "utf8" });
	assert.equal(result.status, 0, result.stderr);
	const deadline = Number(result.stdout.trim());
	assert.ok(deadline >= Math.floor(expiresAt / 1000));
	assert.ok(deadline <= Math.ceil(expiresAt / 1000) + 16);
	assert.match(probe, /AWTSMOOS_SELF_UPDATE_DISABLED=1/);
	assert.doesNotMatch(probe, /AWTSMOOS_DISABLE_SELF_UPDATE/);
	assert.match(probe, /AWTSMOOS_CANDIDATE_IDENTITY_MUTATION=1/);
	assert.match(probe, /unset AWTSMOOS_CANDIDATE_IDENTITY_MUTATION/);
	assert.match(readiness, /extend_candidate_deadline_for_pairing/);
	assert.match(readiness, /candidate-pairing" "waiting"/);
	assert.match(activation, /prove_candidate_before_promotion fresh/);
	assert.match(activation, /prove_candidate_before_promotion readonly/);
	console.log(JSON.stringify({
		ok: true,
		suite: "unix-candidate-pairing-budget",
		pairingDeadlineExtended: true,
		updateProbeReadOnly: true,
		freshIdentityAuthorityExplicit: true,
		selfUpdateDisabled: true
	}));
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}

function read(name) {
	return fs.readFileSync(path.join(downloads, name), "utf8");
}

function quote(value) {
	return `'${String(value).replaceAll("'", "'\\''")}'`;
}
