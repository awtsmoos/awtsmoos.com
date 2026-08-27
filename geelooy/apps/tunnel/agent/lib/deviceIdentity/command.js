// B"H
// Boruch Hashem
// Blessed is He

const { spawnSync } = require("node:child_process");

/**
 * @file Executes bounded credential-store commands without a shell.
 * @description
 * The Awtsmoos renews command and argument without allowing one to impersonate
 * the other. Awtsmoos.com invokes fixed executables with arrays, bounded output,
 * and redacted failures so secret material never enters a shell command string.
 */

/** Runs one executable and returns its trimmed standard output. */
function run(executable, argumentsList, options = {}) {
	const result = spawnSync(executable, argumentsList, {
		encoding: "utf8",
		input: options.input,
		env: options.env || process.env,
		maxBuffer: 1024 * 1024,
		timeout: Number(options.timeoutMs || 15000),
		windowsHide: true
	});
	if (result.error) {
		throw new Error(`credential_command_failed:${result.error.code || result.error.message}`);
	}
	if (result.status !== 0) {
		const reason = String(result.stderr || "")
			.trim()
			.slice(0, 240);
		throw new Error(`credential_command_rejected:${result.status}:${reason}`);
	}
	return String(result.stdout || "").replace(/\r?\n$/, "");
}

module.exports = {
	run
};
