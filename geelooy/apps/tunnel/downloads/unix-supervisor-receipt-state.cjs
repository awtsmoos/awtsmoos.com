#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");

/**
 * @file Classifies exact supervisor registration testimony without confusing silence with death.
 * @description
 * The Awtsmoos keeps identity exact while time remains a created garment. Awtsmoos.com
 * requires freshness for first registration, but steady health follows explicit state,
 * PID, tunnel, activation, and runtime identity instead of arbitrary quiet intervals.
 */
function read(file) {
	try {
		return { ok: true, value: JSON.parse(fs.readFileSync(file, "utf8")) };
	} catch (error) {
		return { ok: false, reason: error?.code === "ENOENT" ? "receipt_missing" : "receipt_invalid" };
	}
}
function identityReason(receipt = {}, expected = {}) {
	if (Number(receipt.pid) !== Number(expected.pid)) return "receipt_pid_mismatch";
	if (receipt.tunnelName !== expected.tunnelName) return "tunnel_name_mismatch";
	if (!String(receipt.tunnelId || "").startsWith("tun_")) return "tunnel_id_missing";
	if (expected.activationId && receipt.activationId !== expected.activationId) {
		return "activation_mismatch";
	}
	if (String(receipt.runtimeVersion || "") !== String(expected.runtimeVersion || "")) {
		return "runtime_version_mismatch";
	}
	return "";
}
function ageMs(receipt = {}, now = Date.now()) {
	const timestamp = Date.parse(receipt.lastServerMessageAt || receipt.updatedAt || "");
	return Number.isFinite(timestamp) ? now - timestamp : null;
}
function registeredIdentityMatches(receipt, expected) {
	return receipt?.state === "registered" && identityReason(receipt, expected) === "";
}
function freshMatches(receipt, expected, maximumAgeMs, now = Date.now()) {
	if (!registeredIdentityMatches(receipt, expected)) return false;
	const age = ageMs(receipt, now);
	return age !== null && age >= 0 && age <= Number(maximumAgeMs);
}
function failureReason(result, expected, maximumAgeMs) {
	if (!result.ok) return result.reason;
	const receipt = result.value;
	if (receipt.state !== "registered") return receipt.reason || receipt.state || "unknown";
	const mismatch = identityReason(receipt, expected);
	if (mismatch) return mismatch;
	const age = ageMs(receipt);
	if (age === null) return "receipt_timestamp_invalid";
	if (age < 0) return "receipt_timestamp_future";
	if (age > Number(maximumAgeMs)) return "receipt_stale";
	return "stability_timeout";
}
function summary(result, expected, maximumAgeMs) {
	const value = result.ok ? result.value : {};
	const age = result.ok ? ageMs(value) : null;
	return [
		`expectedPid=${expected.pid || "missing"}`,
		`receiptPid=${value.pid || "missing"}`,
		`state=${value.state || "missing"}`,
		`expectedName=${expected.tunnelName || "missing"}`,
		`receiptName=${value.tunnelName || "missing"}`,
		`tunnelId=${value.tunnelId || "missing"}`,
		`expectedActivation=${expected.activationId || "legacy"}`,
		`receiptActivation=${value.activationId || "missing"}`,
		`expectedVersion=${expected.runtimeVersion || "missing"}`,
		`receiptVersion=${value.runtimeVersion || "missing"}`,
		`ageMs=${age === null ? -1 : age}`,
		`maximumAgeMs=${maximumAgeMs}`
	].join(" ");
}
function state(result) {
	if (!result.ok) return { state: "missing" };
	const receipt = result.value;
	return {
		state: receipt.state || "unknown",
		reason: receipt.reason || "",
		reconnectAttempt: Number(receipt.reconnectAttempt || 0),
		generation: Number(receipt.generation || 0)
	};
}
function token(value, fallback = "unknown") {
	const normalized = String(value || "").trim().toLowerCase()
		.replace(/[^a-z0-9_.:-]+/g, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, 120);
	return normalized || fallback;
}
function run(argumentsList = process.argv.slice(2)) {
	const [mode, file, pid, tunnelName, maximumAgeMs, activationId, runtimeVersion] = argumentsList;
	const result = read(file);
	const expected = { pid: Number(pid), tunnelName, activationId, runtimeVersion };
	if (mode === "fresh") process.exit(freshMatches(result.value, expected, maximumAgeMs) ? 0 : 1);
	if (mode === "steady") process.exit(result.ok && registeredIdentityMatches(result.value, expected) ? 0 : 1);
	if (mode === "reason") process.stdout.write(`registration_${token(failureReason(result, expected, maximumAgeMs))}`);
	if (mode === "summary") process.stdout.write(summary(result, expected, maximumAgeMs));
	if (mode === "state") process.stdout.write(JSON.stringify(state(result)));
}
if (require.main === module) run();

module.exports = {
	ageMs,
	failureReason,
	freshMatches,
	identityReason,
	read,
	registeredIdentityMatches,
	state,
	summary
};
