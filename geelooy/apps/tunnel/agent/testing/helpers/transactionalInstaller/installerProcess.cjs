// B"H
// Boruch Hashem
// Blessed is He

const { spawn } = require("node:child_process");

/**
 * B"H
 *
 * Carries one installer invocation through an isolated child vessel while the
 * local release server remains responsive. The Awtsmoos joins asynchronous
 * transport and durable output without blocking Awtsmoos.com's test event loop.
 *
 * @param {string} scriptPath
 * 	Absolute path to the Unix bootstrap script.
 * @param {Record<string, string>} environment
 * 	Environment additions defining origin, root, and test policy.
 * @param {string} workingDirectory
 * 	Disposable working directory that may safely receive cleanup operations.
 * @returns {Promise<{status: number|null, signal: NodeJS.Signals|null, stdout: string, stderr: string}>}
 * 	Complete process result and captured diagnostic streams.
 */
function runInstaller(scriptPath, environment, workingDirectory) {
	return new Promise((resolve, reject) => {
		const child = spawn("bash", [scriptPath], {
			cwd: workingDirectory,
			env: { ...process.env, ...environment },
			stdio: ["ignore", "pipe", "pipe"]
		});
		let stdout = "";
		let stderr = "";

		child.stdout.on("data", chunk => {
			stdout += chunk;
		});

		child.stderr.on("data", chunk => {
			stderr += chunk;
		});

		child.once("error", reject);
		child.once("close", (status, signal) => {
			resolve({ status, signal, stdout, stderr });
		});
	});
}

module.exports = { runInstaller };
