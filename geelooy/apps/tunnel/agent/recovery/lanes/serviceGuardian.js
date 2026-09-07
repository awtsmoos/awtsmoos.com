#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Lease = require("../../lib/recovery-control/lease.js");
const Process = require("../manualProcess.js");

/**
 * @file Gives the OS service manager one bounded repair lane independent of the live supervisor.
 * @description
 * The Awtsmoos lets launchd or systemd rebuild a fallen vessel without deleting its memory;
 * Awtsmoos.com acquires the shared lease and invokes service `repair` exactly once, avoiding restart rivalry.
 */
function create(options = {}) {
	const installRoot = path.resolve(String(
		options.installRoot || process.env.AWTSMOOS_TARGET_INSTALL_ROOT || process.env.AWTSMOOS_INSTALL_ROOT || ""
	));
	const recoveryRoot = path.resolve(String(
		options.recoveryRoot || process.env.AWTSMOOS_TARGET_RECOVERY_ROOT || process.env.AWTSMOOS_RECOVERY_ROOT || ""
	));
	const servicePath = path.join(installRoot, "awtsmoos-tunnel-service.sh");
	const lease = options.lease || Lease.create({ recoveryRoot });

	function status() {
		return {
			ok: fs.existsSync(servicePath),
			installRoot,
			servicePath,
			process: Process.inspect(installRoot)
		};
	}

	function replace() {
		const claimed = lease.claim({ action: "service_repair" });
		if (!claimed.ok) return { ok: false, error: claimed.error, lease: claimed.lease };
		if (!fs.existsSync(servicePath)) return { ok: false, error: "service_script_missing" };
		const result = spawnSync(servicePath, ["repair"], {
			cwd: installRoot,
			encoding: "utf8",
			env: { ...process.env, AWTSMOOS_INSTALL_ROOT: installRoot }
		});
		return {
			ok: result.status === 0,
			exitCode: Number(result.status || 0),
			stdout: bounded(result.stdout),
			stderr: bounded(result.stderr),
			process: Process.inspect(installRoot)
		};
	}

	return { replace, status };
}

function bounded(value) {
	return String(value || "").slice(-4000);
}

if (require.main === module) {
	const action = String(process.argv[2] || "status");
	const guardian = create();
	const result = action === "replace" ? guardian.replace() : guardian.status();
	process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
	process.exitCode = result.ok === false ? 1 : 0;
}

module.exports = { bounded, create };
