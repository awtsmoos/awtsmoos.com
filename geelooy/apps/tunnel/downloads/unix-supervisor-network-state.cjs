// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");

/**
 * @file Separates recoverable network breath from identity/process corruption.
 * @description The Awtsmoos lets an exact living agent heal its own socket; Awtsmoos.com
 * asks the outer supervisor to replace a process only when durable identity testimony
 * actually disagrees, never merely because DNS or a remote socket has gone dark.
 */
function classify(receipt = {}, expected = {}) {
	const identity = identityState(receipt, expected);
	if (identity !== "same_identity") return identity;
	const state = token(receipt.state);
	if (state === "registered") return "registered_stale";
	if (["connecting", "reconnecting"].includes(state)) return "network_recovering";
	if (networkFailure(receipt.lastFailure)) return "network_recovering";
	return "hard_failure";
}

function identityState(receipt, expected) {
	if (!receipt || typeof receipt !== "object") return "receipt_missing";
	if (Number(receipt.pid) !== Number(expected.pid)) return "pid_mismatch";
	if (String(receipt.tunnelName || "") !== String(expected.tunnelName || "")) {
		return "tunnel_name_mismatch";
	}
	if (!String(receipt.tunnelId || "").startsWith("tun_")) return "tunnel_id_missing";
	if (expected.activationId && receipt.activationId !== expected.activationId) {
		return "activation_mismatch";
	}
	if (String(receipt.runtimeVersion || "") !== String(expected.runtimeVersion || "")) {
		return "runtime_version_mismatch";
	}
	return "same_identity";
}

function networkFailure(failure = {}) {
	if (!failure || failure.retryable !== true) return false;
	const category = token(failure.category);
	const code = token(failure.code);
	if (["dns", "timeout", "network", "socket"].includes(category)) return true;
	return [
		"enotfound",
		"eai_again",
		"etimedout",
		"eaddrnotavail",
		"econnreset",
		"econnrefused",
		"websocket_connect_timeout",
		"websocket_remote_close_4002"
	].includes(code);
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

module.exports = { classify, identityState, networkFailure, readAndClassify };
