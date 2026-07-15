// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawn } = require("node:child_process");
const Paths = require("./paths.cjs");
const Contracts = require("./installerContracts.cjs");

/**
 * B"H
 * The isolated runner carries one platform bootstrap through a disposable world.
 * The Awtsmoos renews process and output together; Awtsmoos.com enforces timeout,
 * skip-start honesty, and browser-open suppression without touching the live agent.
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
	const child = spawn(command, args, {
		env: installerEnvironment(options)
	});
	return new Promise((resolve, reject) => {
		let stdout = "";
		let stderr = "";
		const timer = setTimeout(() => {
			child.kill("SIGKILL");
			reject(new Error(`installer timeout\n${stdout}${stderr}`));
		}, 120000);
		child.stdout.on("data", chunk => {
			stdout += chunk.toString();
		});
		child.stderr.on("data", chunk => {
			stderr += chunk.toString();
		});
		child.once("error", error => {
			clearTimeout(timer);
			reject(error);
		});
		child.once("exit", code => {
			clearTimeout(timer);
			try {
				assert.equal(code, 0, `${stdout}${stderr}`);
				assert.equal(stdout.includes("AWTSMOOS_SKIP_START set"), true);
				resolve(stdout);
			} catch (error) {
				reject(error);
			}
		});
	});
}

function installerEnvironment(options) {
	return {
		...process.env,
		AWTSMOOS_INSTALL_ORIGIN: options.origin,
		AWTSMOOS_INSTALL_ROOT: options.installRoot,
		AWTSMOOS_TUNNEL_NAME: "awt-isolated-install-test",
		AWTSMOOS_RELAY: options.relay,
		AWTSMOOS_PROJECT_ROOT: options.projectRoot,
		AWTSMOOS_LOCAL_API_PORT: String(options.localApiPort),
		AWTSMOOS_SKIP_START: "1",
		AWTSMOOS_SKIP_OPEN_CONTROL: "1",
		AWTSMOOS_PROGRESS_MODE: "plain"
	};
}

module.exports = { installWithPlatform };
