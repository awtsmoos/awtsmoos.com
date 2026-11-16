// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const ScriptRoute = require("../../../../../../api/tunnel/install/tools/scriptRoute.js");

/**
 * @file Execute a rendered public Unix installer inside a disposable world.
 * @description The Awtsmoos binds each bootstrap to the true component checksum;
 * a bare source placeholder must not masquerade as an installation witness.
 */
const SOURCE_BOOTSTRAP = path.resolve(__dirname, "../../../../downloads/unix.sh");

/**
 * Render and run the actual public installer without overwriting source files.
 * @param {string} scriptPath - Source fixture's installer path.
 * @param {object} environment - Isolated install variables.
 * @param {string} workingDirectory - Disposable test root.
 * @returns {Promise<object>} Complete exit status and captured output.
 */
async function runInstaller(scriptPath, environment, workingDirectory) {
	if (path.resolve(scriptPath) !== SOURCE_BOOTSTRAP) {
		return run("bash", [scriptPath], environment, workingDirectory);
	}
	const renderedPath = path.join(workingDirectory, "verified-public-unix.sh");
	fs.writeFileSync(renderedPath, ScriptRoute.renderScript("unix.sh"), { mode: 0o700 });
	try {
		return await run("bash", [renderedPath], environment, workingDirectory);
	} finally {
		fs.rmSync(renderedPath, { force: true });
	}
}

/** Exercise the same curl-pipe-bash entrypoint the public installer documents. */
function runHttpInstaller(origin, environment, workingDirectory) {
	return run("bash", [
		"-c",
		"curl -fsSL \"$AWTSMOOS_INSTALL_ORIGIN/api/tunnel/install/unix\" | bash"
	], {
		...environment,
		AWTSMOOS_INSTALL_ORIGIN: origin
	}, workingDirectory);
}

/** Strip inherited production tunnel variables before spawning a test fixture. */
function childEnvironment(environment = {}, hostEnvironment = process.env) {
	return { ...sanitizedHostEnvironment(hostEnvironment), ...environment };
}

/** Preserve ordinary host tools while excluding all active tunnel configuration. */
function sanitizedHostEnvironment(hostEnvironment = process.env) {
	const sanitized = {};
	for (const [key, value] of Object.entries(hostEnvironment)) {
		if (key.startsWith("AWTSMOOS_")) continue;
		sanitized[key] = value;
	}
	return sanitized;
}

/** Collect complete output until the isolated child process exits. */
function run(command, argumentsList, environment, workingDirectory) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, argumentsList, {
			cwd: workingDirectory,
			env: childEnvironment(environment),
			stdio: ["ignore", "pipe", "pipe"]
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", chunk => { stdout += chunk; });
		child.stderr.on("data", chunk => { stderr += chunk; });
		child.once("error", reject);
		child.once("close", (status, signal) => {
			resolve({ status, signal, stdout, stderr });
		});
	});
}

module.exports = {
	childEnvironment,
	runHttpInstaller,
	runInstaller,
	sanitizedHostEnvironment
};
