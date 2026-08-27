// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Distinguishes file integrity from proven production readiness.
 * @description
 * The Awtsmoos renews a runtime not merely as bytes but as living service.
 * Awtsmoos.com therefore calls an archive production-ready only when the exact
 * installer witness proves registration, local action, version, life, and stability.
 */
function inspect(runtimeRoot, expectedVersion = "") {
	const receiptPath = path.join(runtimeRoot, "candidate-readiness.json");
	const receipt = read(receiptPath);
	if (!receipt) return result(false, "readiness_receipt_missing", receiptPath, null);
	if (receipt.state !== "ready") return result(false, "readiness_state_not_ready", receiptPath, receipt);
	if (!receipt.registered) return result(false, "registration_not_ready", receiptPath, receipt);
	if (!receipt.localActionReady) return result(false, "local_action_not_ready", receiptPath, receipt);
	if (!receipt.versionReady) return result(false, "version_not_ready", receiptPath, receipt);
	if (!receipt.candidateAlive) return result(false, "candidate_not_alive", receiptPath, receipt);
	const version = String(expectedVersion || "").trim();
	if (version && String(receipt.expectedVersion || "").trim() !== version) {
		return result(false, "readiness_version_mismatch", receiptPath, receipt);
	}
	if (Number(receipt.stableSamples || 0) < 3) {
		return result(false, "readiness_samples_insufficient", receiptPath, receipt);
	}
	return result(true, "production_ready", receiptPath, receipt);
}

function result(ok, reason, receiptPath, receipt) {
	return {
		ok,
		reason,
		receiptPath,
		activationId: receipt?.activationId || "",
		observedAt: receipt?.observedAt || "",
		stableSamples: Number(receipt?.stableSamples || 0),
		stableDurationMs: Number(receipt?.stableDurationMs || 0),
		expectedVersion: receipt?.expectedVersion || ""
	};
}

function read(filePath) {
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	} catch {
		return null;
	}
}

module.exports = {
	inspect,
	read
};
