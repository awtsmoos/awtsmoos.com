//B"H
//Boruch Hashem
//Blessed be He

const { spawnSync } = require("node:child_process");

/**
 * @file Verifies that a DevTools listener belongs to the selected main Chrome PID.
 * @description
 * Process arguments describe intent; the kernel listener describes reality.
 * On systems with lsof, Awtsmoos.com requires both testimonies before trusting
 * a CDP endpoint. Unsupported systems return an explicit unknown verdict.
 */
function verify(options = {}) {
	const pid = Number(options.pid || 0);
	const port = Number(options.port || 0);
	const host = String(options.host || "127.0.0.1");
	if (!validPid(pid) || !validPort(port)) {
		return { known: true, ok: false, reason: "invalid_endpoint_identity" };
	}
	const result = runLsof(pid, host, port, options.runner);
	if (result.unsupported) {
		return { known: false, ok: true, reason: "listener_verifier_unavailable" };
	}
	const owners = parsePids(result.stdout);
	return {
		known: true,
		ok: owners.includes(pid),
		reason: owners.includes(pid) ? "listener_owned" : "listener_owner_mismatch",
		owners
	};
}
/** Executes a bounded lsof query without invoking a shell. */
function runLsof(pid, host, port, runner = spawnSync) {
	const result = runner("lsof", [
		"-nP",
		"-a",
		"-p",
		String(pid),
		`-iTCP@${host}:${port}`,
		"-sTCP:LISTEN",
		"-Fp"
	], {
		encoding: "utf8",
		timeout: 2000
	});
	if (result?.error?.code === "ENOENT") {
		return { unsupported: true, stdout: "" };
	}
	return {
		unsupported: false,
		stdout: String(result?.stdout || "")
	};
}

function parsePids(text = "") {
	return [...new Set(String(text)
		.split(/\r?\n/)
		.filter(line => /^p\d+$/.test(line))
		.map(line => Number(line.slice(1))))];
}
function validPid(pid) {
	return Number.isInteger(pid) && pid > 0;
}

function validPort(port) {
	return Number.isInteger(port) && port > 0 && port <= 65535;
}

module.exports = {
	parsePids,
	verify
};
