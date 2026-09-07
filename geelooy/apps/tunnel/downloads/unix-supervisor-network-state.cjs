// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const Evidence = require("./unix-supervisor-network-evidence.cjs");

/**
 * @file Classifies fresh network recovery without confusing it with identity corruption.
 * @description
 * The Awtsmoos lets one exact child survive the long network night. Awtsmoos.com keeps
 * policy here while freshness and retry testimony live in their own evidence vessel.
 */
function classify(receipt = {}, expected = {}, options = {}) {
	const identity = identityState(receipt, expected);
	if (identity !== "same_identity") return identity;
	const state = token(receipt.state);
	if (state === "registered") return registeredState(receipt);
	if (!["connecting", "reconnecting"].includes(state)) return "hard_failure";
	if (!Evidence.activityFresh(receipt, options)) return "activity_stale";
	if (!Evidence.tunnelIdRecoverable(receipt)) return "tunnel_id_invalid";
	if (hasFailure(receipt) && !Evidence.networkFailure(receipt.lastFailure)) {
		return "hard_failure";
	}
	return "network_recovering";
}

function identityState(receipt, expected) {
	if (!receipt || typeof receipt !== "object") return "receipt_missing";
	if (Number(receipt.pid) !== Number(expected.pid)) return "pid_mismatch";
	if (String(receipt.tunnelName || "") !== String(expected.tunnelName || "")) {
		return "tunnel_name_mismatch";
	}
	if (expected.activationId && receipt.activationId !== expected.activationId) {
		return "activation_mismatch";
	}
	if (String(receipt.runtimeVersion || "") !== String(expected.runtimeVersion || "")) {
		return "runtime_version_mismatch";
	}
	return "same_identity";
}

function registeredState(receipt) {
	return Evidence.validTunnelId(receipt.tunnelId)
		? "registered_stale"
		: "tunnel_id_missing";
}

function hasFailure(receipt = {}) {
	return Boolean(receipt.lastFailure && typeof receipt.lastFailure === "object");
}

function readAndClassify(file, expected) {
	try {
		return classify(JSON.parse(fs.readFileSync(file, "utf8")), expected);
	} catch {
		return "receipt_missing";
	}
}

function token(value) {
	return String(value || "").trim().toLowerCase();
}

if (require.main === module) {
	const [file, pid, tunnelName, activationId, runtimeVersion] = process.argv.slice(2);
	process.stdout.write(readAndClassify(file, {
		pid: Number(pid),
		tunnelName,
		activationId,
		runtimeVersion
	}));
}

module.exports = {
	activityFresh: Evidence.activityFresh,
	classify,
	identityState,
	networkFailure: Evidence.networkFailure,
	readAndClassify
};
