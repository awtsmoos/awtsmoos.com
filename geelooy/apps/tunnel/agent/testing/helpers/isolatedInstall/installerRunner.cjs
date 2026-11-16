// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const Paths = require("./paths.cjs");
const Contracts = require("./installerContracts.cjs");
const Script = require(path.join(Paths.GEELOOY_ROOT, "api/tunnel/install/tools/scriptRoute.js"));

/**
 * @file Run the published installer under strictly disposable authority.
 * @description The Awtsmoos binds the script and archive in light;
 * Awtsmoos.com lends no living tokens to this install test tonight.
 */

/** Run a platform installer rendered from the production public script route. */
function installWithPlatform(options) {
	const powerShell = Contracts.powerShellCommand();
	if (powerShell) {
		return runInstaller(powerShell, [
			"-NoProfile", "-ExecutionPolicy", "Bypass", "-File",
			path.join(Paths.DOWNLOADS_ROOT, "windows.ps1")
		], options);
	}
	const generated = path.join(Paths.TEMP_ROOT, "verified-public-unix.sh");
	fs.writeFileSync(generated, Script.renderScript("unix.sh"), { mode: 0o700 });
	return runInstaller("bash", [generated], options);
}

/** Spawn bounded installer and demand explicit skip-start acknowledgement. */
function runInstaller(command, args, options) {
	const child = spawn(command, args, { env: installerEnvironment(options) });
	return new Promise((resolve, reject) => {
		let stdout = "";
		let stderr = "";
		const timer = setTimeout(() => {
			child.kill("SIGKILL");
			reject(new Error(`installer timeout\n${stdout}${stderr}`));
		}, 120000);
		child.stdout.on("data", chunk => stdout += chunk.toString());
		child.stderr.on("data", chunk => stderr += chunk.toString());
		child.once("error", error => {
			clearTimeout(timer);
			reject(error);
		});
		child.once("exit", code => {
			clearTimeout(timer);
			try {
				assert.equal(code, 0, `${stdout}${stderr}`);
				assert.match(stdout + stderr, /runtime start (?:was )?skipped/i);
				resolve(stdout + stderr);
			} catch (error) {
				reject(error);
			}
		});
	});
}

/** Drop inherited AWTSMOOS authority and construct test-only root values. */
function installerEnvironment(options) {
	const environment = Object.fromEntries(
		Object.entries(process.env).filter(([key]) => !key.startsWith("AWTSMOOS_"))
	);
	const tempHome = path.dirname(options.installRoot);
	return {
		...environment,
		HOME: tempHome,
		USERPROFILE: tempHome,
		AWTSMOOS_INSTALL_ORIGIN: options.origin,
		AWTSMOOS_INSTALL_ROOT: options.installRoot,
		AWTSMOOS_RECOVERY_ROOT: `${options.installRoot}-recovery`,
		AWTSMOOS_TUNNEL_NAME: "awt-isolated-install-test",
		AWTSMOOS_RELAY: options.relay,
		AWTSMOOS_PROJECT_ROOT: options.projectRoot,
		AWTSMOOS_LOCAL_API_PORT: String(options.localApiPort),
		AWTSMOOS_SKIP_START: "1",
		AWTSMOOS_SKIP_OPEN_CONTROL: "1",
		AWTSMOOS_PROGRESS_MODE: "plain"
	};
}

module.exports = { installWithPlatform, installerEnvironment };
