// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const Slot = require("./emergencySlot.js");
const Paths = require("./emergencySlotPaths.js");

/**
 * @file Launches the sealed emergency runtime without the normal supervisor/controller.
 * @description
 * The Awtsmoos keeps one repair flame outside the replaceable palace. Awtsmoos.com
 * verifies its seal, prepares authenticated identity inside that sealed world, and
 * starts one bounded Tier-Zero child whose PID and log live only in the recovery root.
 */
function launch(recoveryRoot, options = {}) {
	const verified = Slot.verify(recoveryRoot);
	if (!verified.ok) return failure("sealed_emergency_invalid", { verified });
	const existing = running(recoveryRoot);
	if (existing.ok) return { ...existing, alreadyRunning: true };
	const prepared = prepare(verified.root, recoveryRoot);
	if (!prepared.ok) return failure("sealed_emergency_identity_unavailable", { prepared });
	if (options.dryRun) {
		return { ok: true, state: "sealed_emergency_ready", dryRun: true, root: verified.root, prepared };
	}
	fs.mkdirSync(path.dirname(Paths.log(recoveryRoot)), { recursive: true, mode: 0o700 });
	const log = fs.openSync(Paths.log(recoveryRoot), "a", 0o600);
	const config = readJson(path.join(verified.root, "config.json")) || {};
	const child = spawn(process.execPath, [path.join(verified.root, "awtsmoos-agent-launcher.cjs"), verified.root], {
		cwd: config.root || process.cwd(),
		detached: true,
		env: emergencyEnvironment(verified.root, recoveryRoot, config.root),
		stdio: ["ignore", log, log]
	});
	child.unref();
	fs.closeSync(log);
	fs.writeFileSync(Paths.pid(recoveryRoot), `${child.pid}\n`, { mode: 0o600 });
	return {
		ok: true,
		state: "sealed_emergency_started",
		root: verified.root,
		pid: child.pid,
		log: Paths.log(recoveryRoot),
		prepared
	};
}

function running(recoveryRoot) {
	const pid = readPid(Paths.pid(recoveryRoot));
	if (!pid) return { ok: false, state: "not_running" };
	try {
		process.kill(pid, 0);
		return { ok: true, state: "sealed_emergency_running", pid, root: Paths.current(recoveryRoot) };
	} catch {
		return { ok: false, state: "not_running" };
	}
}

function prepare(slotRoot, recoveryRoot) {
	const script = path.join(slotRoot, "scripts", "emergency-control.cjs");
	const result = spawnSync(process.execPath, [script, "prepare", slotRoot, recoveryRoot], {
		encoding: "utf8",
		env: { ...process.env, AWTSMOOS_RECOVERY_ROOT: recoveryRoot },
		timeout: 15000
	});
	let value = null;
	try {
		value = JSON.parse(String(result.stdout || "").trim());
	} catch {}
	return value?.ok ? value : failure("sealed_emergency_prepare_failed", {
		status: result.status,
		stderr: String(result.stderr || "").trim()
	});
}

function emergencyEnvironment(slotRoot, recoveryRoot, projectRoot) {
	return {
		...process.env,
		AWTSMOOS_INSTALL_ROOT: slotRoot,
		AWTSMOOS_RECOVERY_ROOT: recoveryRoot,
		AWTSMOOS_PROJECT_ROOT: projectRoot || process.cwd(),
		AWTSMOOS_COMMAND_TIER: "0",
		AWTSMOOS_COMMAND_MAX_ACTIVE: "1",
		AWTSMOOS_EMERGENCY_MODE: "1",
		AWTSMOOS_MISSION_BOOT_RESUME: "0",
		AWTSMOOS_SELF_UPDATE_DISABLED: "1"
	};
}

function readPid(file) {
	try {
		const value = Number(fs.readFileSync(file, "utf8").trim());
		return Number.isInteger(value) && value > 1 ? value : 0;
	} catch {
		return 0;
	}
}

function readJson(file) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return null;
	}
}

function failure(error, details = {}) {
	return { ok: false, state: "sealed_emergency_failed", error, ...details };
}

module.exports = { emergencyEnvironment, launch, prepare, running };
