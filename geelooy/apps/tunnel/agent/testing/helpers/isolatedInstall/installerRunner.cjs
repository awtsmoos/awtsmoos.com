// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawn } = require("node:child_process");
const Paths = require("./paths.cjs");
const Contracts = require("./installerContracts.cjs");

/**
 * @file Runs the public installer inside a hermetic disposable identity world.
 * @description
 * The Awtsmoos does not let a test borrow the living tunnel's recovery covenant.
 * Awtsmoos.com removes inherited AWTSMOOS_* authority, then grants only temporary
 * roots, relay, and skip-start testimony before invoking the real platform script.
 */
function installWithPlatform(options) {
	const powerShell = Contracts.powerShellCommand();
	return powerShell
		? runInstaller(powerShell, [
			"-NoProfile",
			"-ExecutionPolicy",
			"Bypass",
			"-File",
			path.join(Paths.DOWNLOADS_ROOT, "windows.ps1")
		], options)
		: runInstaller("bash", [path.join(Paths.DOWNLOADS_ROOT, "unix.sh")], options);
}

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
				assert.match(
					stdout,
					/runtime start (?:was )?skipped/i,
					"installer must acknowledge requested skip-start mode"
				);
				resolve(stdout);
			} catch (error) {
				reject(error);
			}
		});
	});
}

function installerEnvironment(options) {
	const environment = withoutAwtsmoosAuthority(process.env);
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

function withoutAwtsmoosAuthority(source) {
	return Object.fromEntries(
		Object.entries(source).filter(([key]) => !key.startsWith("AWTSMOOS_"))
	);
}

module.exports = {
	installWithPlatform,
	installerEnvironment,
	withoutAwtsmoosAuthority
};
