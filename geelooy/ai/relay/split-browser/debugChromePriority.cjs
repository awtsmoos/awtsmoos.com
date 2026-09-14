//B"H
//Boruch Hashem
//Blessed be He

const { spawnSync } = require("node:child_process");

/**
 * @file Lowers Shared AI Chrome scheduling priority after a fresh spawn.
 * @description
 * Tunnel health, recovery lanes, and remote control are more important than
 * browser rendering. Raising the nice value keeps Chrome from starving them
 * during startup spikes while preserving normal browser functionality.
 */
function lower(pid, options = {}) {
	const target = Number(pid);
	if (!Number.isInteger(target) || target <= 0) {
		return { ok: false, reason: "invalid_pid" };
	}
	if (process.platform === "win32") {
		return { ok: true, supported: false };
	}
	const niceValue = Math.max(1, Math.min(19, Number(options.niceValue || 10)));
	const result = spawnSync("renice", [String(niceValue), "-p", String(target)], {
		encoding: "utf8",
		timeout: 1500
	});
	return {
		ok: result.status === 0,
		supported: true,
		niceValue,
		error: result.status === 0 ? null : String(result.stderr || "renice_failed").trim()
	};
}

module.exports = { lower };
