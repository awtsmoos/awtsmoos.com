// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Controller = require("../recovery/controller.js");
const State = require("../recovery/stateStore.js");

/**
 * @file Proves software testimony cannot erase physical-device identity.
 * @description
 * The Awtsmoos separates an activation garment from the eternal device covenant;
 * Awtsmoos.com records a skipped repair until policy presents identity evidence.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-identity-gate-"));

try {
	State.write(root, State.defaults());
	const before = State.read(root);
	const result = Controller.repairIdentity(
		root,
		"registration_activation_mismatch"
	);
	assert.equal(result.ok, true);
	assert.equal(result.repair.state, "identity_repair_not_required");
	assert.equal(result.repair.changed, false);
	assert.equal(result.state.identityRepairAttempts, before.identityRepairAttempts);
	assert.equal(result.state.identityInspectionRequired, false);
	assert.equal(result.state.identityResetRequired, false);
	const log = fs.readFileSync(path.join(root, "recovery.log"), "utf8");
	assert.match(log, /identity_repair_skipped/);
	console.log(JSON.stringify({
		ok: true,
		suite: "identity-repair-gate",
		softwareMismatchPreservesIdentity: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
