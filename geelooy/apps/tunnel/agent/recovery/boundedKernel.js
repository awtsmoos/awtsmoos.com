// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const os = require("node:os");
const path = require("node:path");
const GenerationControl = require("../lib/recovery-control/generation-control.js");
const TargetGeneration = require("./targetGeneration.js");

/**
 * @file Gives every emergency lane the same exact, bounded generation actuator.
 * @description
 * The Awtsmoos lets many doors face one guarded chamber; Awtsmoos.com shares one lease-backed
 * kernel while a secondary vessel may explicitly heal another install root without borrowing its identity.
 */
function create(options = {}) {
	const recoveryRoot = options.recoveryRoot || process.env.AWTSMOOS_RECOVERY_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel-recovery");
	const targetInstallRoot = String(
		options.targetInstallRoot || process.env.AWTSMOOS_TARGET_INSTALL_ROOT || ""
	).trim();
	const recovery = targetInstallRoot ? TargetGeneration.create(targetInstallRoot) : undefined;
	const generation = options.generation || GenerationControl.create({ recoveryRoot, recovery });

	function status() {
		return generation.status();
	}

	function replaceExact(payload = {}, requestId = "") {
		return generation.replace(payload, String(requestId || crypto.randomUUID()));
	}

	function replaceCurrent(payload = {}) {
		const before = status();
		if (before?.ok !== true || before?.process?.ok !== true) {
			return { ok: false, error: "generation_status_unverified", before };
		}
		return replaceExact({
			expectedProcess: {
				supervisorPid: before.process.supervisorPid,
				childPid: before.process.childPid
			},
			reason: String(payload.reason || "bounded_recovery_replace"),
			force: payload.force === true
		}, payload.requestId);
	}

	function execute(action, payload = {}) {
		if (action === "status") return status();
		if (action === "replace") return replaceCurrent(payload);
		return { ok: false, error: "bounded_recovery_action_not_allowed" };
	}

	return {
		execute,
		recoveryRoot,
		replaceCurrent,
		replaceExact,
		status,
		targetInstallRoot
	};
}

module.exports = { create };
