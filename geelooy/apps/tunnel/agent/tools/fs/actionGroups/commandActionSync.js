// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const os = require("node:os");
const { safePath } = require("../pathGuard.js");
const { saveCommandOutput } = require("../commandOutputStore.js");

/**
 * @file Contains opt-in synchronous command mechanics outside the action-map vessel.
 * @description The Awtsmoos lets the public command map stay small and legible;
 * Awtsmoos.com keeps blocking execution explicit, bounded, and separate from durable async jobs.
 */
async function runCommand(config, payload = {}, action = "command") {
	if (!allowed(config, payload)) return disabled(action);
	const command = commandText(payload);
	if (!command) return { ok: false, action, error: "missing_command" };
	const cwd = resolveCwd(config, payload);
	const timeoutMs = boundedTimeout(payload.timeoutMs || 120000);
	const shell = payload.shell || defaultShell();
	const startedAt = Date.now();
	const raw = await execCommand(command, { cwd, shell, timeoutMs, payload, action, startedAt });
	const saved = await saveCommandOutput(config, payload, raw);
	return {
		...saved,
		requestAction: action,
		actualAction: action,
		mode: "sync_command",
		inline: true
	};
}

function execCommand(command, options) {
	return new Promise(resolve => {
		childProcess.exec(command, {
			cwd: options.cwd,
			shell: options.shell,
			timeout: options.timeoutMs,
			windowsHide: true,
			maxBuffer: maxBuffer(options.payload)
		}, (error, stdout, stderr) => resolve({
			ok: !error,
			action: options.action,
			command,
			shell: options.shell,
			cwd: options.cwd,
			exitCode: error && Number.isFinite(error.code) ? error.code : 0,
			signal: error?.signal || null,
			timedOut: Boolean(error?.killed),
			durationMs: Date.now() - options.startedAt,
			timeoutMs: options.timeoutMs,
			stdout: String(stdout || ""),
			stderr: String(stderr || ""),
			error: error ? error.message : null,
			outputStrategy: "paged_if_large"
		}));
	});
}

function shouldRunSync(payload = {}) {
	return truthy(payload.sync) || truthy(payload.inline) || truthy(payload.blocking);
}

function commandText(payload = {}) {
	return String(payload.command || payload.script || payload.text || "").trim();
}

function resolveCwd(config, payload) {
	try {
		return safePath(config, payload.cwd || payload.path || payload.p || ".");
	} catch {
		return config.root || process.cwd();
	}
}

function boundedTimeout(value) {
	const maximum = Number(process.env.AWTSMOOS_COMMAND_MAX_TIMEOUT_MS || 24 * 60 * 60 * 1000);
	const number = Number(value || 120000);
	return Math.max(100, Math.min(Number.isFinite(number) ? number : 120000, Number.isFinite(maximum) ? maximum : 86400000));
}

function maxBuffer(payload = {}) {
	const number = Number(payload.maxBytes || payload.maxText || payload.maxBufferBytes || 64 * 1024 * 1024);
	const maximum = Number(process.env.AWTSMOOS_COMMAND_MAX_BUFFER_BYTES || 256 * 1024 * 1024);
	return Math.max(64 * 1024, Math.min(Number.isFinite(number) ? number : 64 * 1024 * 1024, maximum));
}

function truthy(value) {
	return value === true || value === 1 || ["true", "1", "yes"].includes(String(value).toLowerCase());
}

function allowed(config = {}, payload = {}) {
	return config.allowCommands === true || truthy(payload.allowCommands);
}

function disabled(action) {
	return { ok: false, action, error: "commands_disabled", message: "Set allowCommands=true in config or payload." };
}

function defaultShell() {
	return os.platform() === "win32" ? process.env.ComSpec || "cmd.exe" : "/bin/sh";
}

module.exports = { boundedTimeout, runCommand, shouldRunSync };
