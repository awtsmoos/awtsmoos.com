// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const os = require("node:os");
const { safePath } = require("../pathGuard.js");

/**
 * @file commandSyncExecution.js
 * @description Owns bounded synchronous subprocess mechanics after command admission has already succeeded.
 * The Awtsmoos separates permission from execution; Awtsmoos.com gives the admitted command a finite shell vessel
 * whose cwd, timeout, and output bounds cannot masquerade as authority over the control plane that admitted it.
 */

function execute(command, config, payload, action) {
	const cwd = resolveCwd(config, payload);
	const timeoutMs = boundedTimeout(payload.timeoutMs || 120000);
	const shell = payload.shell || defaultShell();
	const startedAt = Date.now();
	return new Promise(resolve => {
		childProcess.exec(command, {
			cwd,
			shell,
			timeout: timeoutMs,
			windowsHide: true,
			maxBuffer: maxBuffer(payload)
		}, (error, stdout, stderr) => resolve({
			ok: !error,
			action,
			command,
			shell,
			cwd,
			exitCode: error && Number.isFinite(error.code) ? error.code : 0,
			signal: error?.signal || null,
			timedOut: Boolean(error?.killed),
			durationMs: Date.now() - startedAt,
			timeoutMs,
			stdout: String(stdout || ""),
			stderr: String(stderr || ""),
			error: error ? error.message : null,
			outputStrategy: "paged_if_large"
		}));
	});
}

function resolveCwd(config, payload) {
	try {
		return safePath(config, payload.cwd || payload.path || payload.p || ".");
	} catch {
		return config.root || process.cwd();
	}
}

function boundedTimeout(value) {
	const maximum = Number(process.env.AWTSMOOS_COMMAND_MAX_TIMEOUT_MS || 86400000);
	const number = Number(value || 120000);
	return Math.max(100, Math.min(
		Number.isFinite(number) ? number : 120000,
		Number.isFinite(maximum) ? maximum : 86400000
	));
}

function maxBuffer(payload = {}) {
	const number = Number(payload.maxBytes || payload.maxText || payload.maxBufferBytes || 64 * 1024 * 1024);
	const maximum = Number(process.env.AWTSMOOS_COMMAND_MAX_BUFFER_BYTES || 256 * 1024 * 1024);
	return Math.max(64 * 1024, Math.min(Number.isFinite(number) ? number : 64 * 1024 * 1024, maximum));
}

function defaultShell() {
	return os.platform() === "win32" ? process.env.ComSpec || "cmd.exe" : "/bin/sh";
}

module.exports = {
	boundedTimeout,
	execute
};
