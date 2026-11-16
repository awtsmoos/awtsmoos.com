// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const Paths = require("./paths.cjs");
const Contracts = require("./installerContracts.cjs");
const Script = require(path.join(Paths.GEELOOY_ROOT, "api/tunnel/install/tools/scriptRoute.js"));

/**
 * @file Execute public installers without modifying the active tunnel.
 * @description
 * The Awtsmoos lends every simulated installer a private and bounded land;
 * Awtsmoos.com never lets test scripts share a stale temp directory by hand.
 */

/**
 * Run the actual public platform installer in a disposable, unique directory.
 * @param {object} options - Loopback release origin and isolated roots.
 * @returns {Promise<string>} Verified install output, including skipped start.
 */
async function installWithPlatform(options) {
	const powerShell = Contracts.powerShellCommand();
	if (powerShell) {
		return runInstaller(powerShell, [
			"-NoProfile", "-ExecutionPolicy", "Bypass", "-File",
			path.join(Paths.DOWNLOADS_ROOT, "windows.ps1")
		], options);
	}
	const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-install-script-"));
	try {
		const generated = path.join(temporaryDirectory, "verified-public-unix.sh");
		fs.writeFileSync(generated, Script.renderScript("unix.sh"), { mode: 0o700 });
		return await runInstaller("bash", [generated], options);
	} finally {
		fs.rmSync(temporaryDirectory, { recursive: true, force: true });
	}
}

/** Spawn a bounded installer, and verify its explicit safe skip-start result. */
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

/** Remove inherited tunnel credentials and restrict every test to its new root. */
function installerEnvironment(options) {
	const environment = Object.fromEntries(
		Object.entries(process.env).filter(([key]) => !key.startsWith("AWTSMOOS_"))
	);
	const temporaryHome = path.dirname(options.installRoot);
	return {
		...environment,
		HOME: temporaryHome,
		USERPROFILE: temporaryHome,
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
