// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Diagnostics = require("./diagnostics.js");
const Integrity = require("./integrity.js");
const Process = require("./manualProcess.js");
const State = require("./stateStore.js");

/**
 * @file Keeps every read-only emergency question free from repair side effects.
 * @description
 * The Awtsmoos reveals truth before motion. Awtsmoos.com separates diagnosis from
 * mutation so status may be asked repeatedly during fear without changing one PID,
 * archive, credential, tier, or recovery-state witness in the vessel below.
 */
function status(root, version) {
	const processes = Process.inspect(root);
	const registration = registrationStatus(root, processes);
	return {
		ok: processes.ok && registration.ok,
		command: "status",
		...(processes.ok && registration.ok ? {} : { error: !processes.ok ? "supervised_process_unavailable" : registration.reason }),
		root,
		version,
		recovery: State.read(root),
		processes,
		registration
	};
}

/** A connection-state receipt is only current when its owning agent still runs. */
function registrationStatus(root, processes = {}, now = Date.now()) {
	let receipt;
	try {
		receipt = JSON.parse(fs.readFileSync(path.join(root, "connection-state.json"), "utf8"));
	} catch {
		return { ok: false, reason: "registration_receipt_unavailable", state: "unknown" };
	}
	const ownerPid = Number(receipt.ownerPid || receipt.pid || 0);
	const updatedAt = Date.parse(receipt.lastServerMessageAt || receipt.updatedAt || "");
	const ageMs = Number.isFinite(updatedAt) ? now - updatedAt : null;
	const processMatched = processes.ok === true && ownerPid === Number(processes.childPid);
	const fresh = ageMs !== null && ageMs >= 0 && ageMs <= 30000;
	const registered = receipt.state === "registered";
	return {
		ok: processMatched && registered && fresh,
		state: String(receipt.state || "unknown"),
		ownerPid, ageMs, processMatched, fresh,
		reason: !processMatched ? "registration_owner_not_running" : !registered ? "registration_not_confirmed" : !fresh ? "registration_receipt_stale" : "registered"
	};
}

function check(root, version) {
	const processes = Process.inspect(root);
	const integrity = Integrity.check(root);
	return {
		ok: integrity.ok && processes.ok,
		command: "check",
		root,
		version,
		integrity,
		processes
	};
}

function diagnose(root, options = {}) {
	return {
		...Diagnostics.inspect(root, {
			recoveryRoot: options.recoveryRoot
		}),
		command: "diagnose"
	};
}

module.exports = {
	registrationStatus,
	check,
	diagnose,
	status
};
