// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

/**
 * @file Proves autonomous archive recovery cannot interrupt installer-owned activation.
 * @description
 * The Awtsmoos grants one transactional shepherd authority over candidate judgment.
 * Awtsmoos.com resumes ordinary self-healing only after commit or rollback closes it.
 */
const downloadsRoot = path.resolve(import.meta.dirname, "..");
const recoveryModule = path.join(downloadsRoot, "unix-supervisor-recovery.sh");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-recovery-quarantine-"));
const runtimeRoot = path.join(sandbox, ".awtsmoos-tunnel");
const recoveryRoot = path.join(sandbox, ".awtsmoos-tunnel-recovery");
const journal = path.join(recoveryRoot, "transactions", "install-current.json");
fs.mkdirSync(runtimeRoot, { recursive: true });
fs.mkdirSync(path.dirname(journal), { recursive: true });
fs.writeFileSync(path.join(runtimeRoot, "install-state.txt"), "1.0.489\n");

assert.equal(probe("candidate_activated", "activation-proof", "1.0.489"), 0);
assert.equal(probe("candidate_stable", "activation-proof", "1.0.489"), 0);
assert.equal(probe("committed", "activation-proof", "1.0.489"), 1);
assert.equal(probe("candidate_activated", "other-activation", "1.0.489"), 1);
assert.equal(probe("candidate_activated", "activation-proof", "1.0.488"), 1);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-activation-recovery-quarantine",
	installerOwnsCandidateRollback: true,
	recoveryResumesAfterTerminalPhase: true
}, null, 2));

function probe(phase, activationId, version) {
	fs.writeFileSync(journal, JSON.stringify({
		activationId,
		phase,
		version
	}));
	const command = [
		`ROOT=${quote(runtimeRoot)}`,
		`RECOVERY_ROOT=${quote(recoveryRoot)}`,
		"AWTSMOOS_ACTIVATION_ID=activation-proof",
		"RECOVERY_LOG=/dev/null",
		"supervisor_log(){ :; }",
		`source ${quote(recoveryModule)}`,
		"activation_recovery_quarantined"
	].join("; ");
	return spawnSync("bash", ["-c", command]).status;
}

function quote(value) {
	return `'${String(value).replaceAll("'", "'\\''")}'`;
}
