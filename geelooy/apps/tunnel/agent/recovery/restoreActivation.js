// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Controller = require("./controller.js");
const Process = require("./manualProcess.js");

/**
 * @file Rebinds restored bytes to verified living supervision before success.
 * @description
 * The Awtsmoos does not call restored bytes a living tunnel. Awtsmoos.com first
 * remembers the requested tier, renews canonical service custody, then proves
 * supervisor and child belong together before declaring the restoration complete.
 */
async function activate(root, tier, restored, options = {}) {
	if (!restored?.ok) return restored;
	const setTier = options.setTier || (value => Controller.setTier(root, value));
	const inspect = options.inspect || (() => Process.inspect(root));
	const repair = options.repair || (() => repairService(root, options.timeoutMs));
	setTier(tier);
	let processState = inspect();
	if (processState.ok) return success(restored, tier, processState, "already_verified");
	const repairResult = repair();
	if (!repairResult.ok) return failure(restored, tier, processState, repairResult);
	processState = await waitForVerified(inspect, options.verifyTimeoutMs);
	if (!processState.ok) return failure(restored, tier, processState, repairResult);
	return success(restored, tier, processState, "service_repaired", repairResult);
}

function repairService(root, timeoutMs = 30000) {
	const servicePath = path.join(root, "awtsmoos-tunnel-service.sh");
	if (!fs.existsSync(servicePath)) {
		return { ok: false, error: "restore_service_entrypoint_missing", servicePath };
	}
	const result = spawnSync("/bin/bash", [servicePath, "repair"], {
		encoding: "utf8",
		env: { ...process.env, AWTSMOOS_INSTALL_ROOT: root },
		timeout: Math.max(5000, Number(timeoutMs || 30000))
	});
	return {
		ok: result.status === 0,
		error: result.status === 0 ? "" : "restore_service_repair_failed",
		status: result.status,
		stdout: String(result.stdout || "").slice(-4000),
		stderr: String(result.stderr || "").slice(-4000)
	};
}

async function waitForVerified(inspect, timeoutMs = 5000) {
	const deadline = Date.now() + Math.max(500, Number(timeoutMs || 5000));
	let current = inspect();
	while (!current.ok && Date.now() < deadline) {
		await new Promise(resolve => setTimeout(resolve, 125));
		current = inspect();
	}
	return current;
}

function success(restored, tier, processState, activation, repair = null) {
	return { ...restored, ok: true, tier, activation, supervision: processState, repair };
}

function failure(restored, tier, processState, repair) {
	return { ...restored, ok: false, tier, error: "restore_supervision_not_ready",
		supervision: processState, repair };
}

module.exports = { activate, repairService, waitForVerified };
