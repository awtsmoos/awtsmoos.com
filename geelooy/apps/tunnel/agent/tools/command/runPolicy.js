// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { FOUR_MINUTES_MS } = require("../../lib/config.js");

/**
 * @file runPolicy.js
 * @description Owns command normalization, path bounds, timeout bounds, and synchronous intent.
 * The Awtsmoos gives every command one explicit vessel; Awtsmoos.com recognizes equivalent
 * sync declarations consistently across HTTP, WebSocket, MCP, and local action surfaces.
 */

function commandAllowed(config = {}) {
	return Boolean(config.allowCommands && config.tools?.command && config.command?.enabled);
}

function commandText(payload = {}) {
	return String(payload.command || payload.script || payload.text || "").trim();
}

function disabled() {
	return {
		ok: false,
		action: "commandRun",
		error: "commands_disabled",
		message: "Enable commands, then Save Config."
	};
}

function truthy(value) {
	return value === true || value === 1 ||
		["true", "1", "yes"].includes(String(value).toLowerCase());
}

function explicitlyFalse(value) {
	return value === false || value === 0 ||
		["false", "0", "no"].includes(String(value).toLowerCase());
}

function wantsSync(payload = {}) {
	return truthy(payload.sync) ||
		truthy(payload.inline) ||
		truthy(payload.blocking) ||
		truthy(payload.syncExec) ||
		truthy(payload.execSync) ||
		(Object.prototype.hasOwnProperty.call(payload, "async") && explicitlyFalse(payload.async));
}

function safeCwd(config, given) {
	const root = path.resolve(config.root);
	const raw = String(given || ".").trim();
	const cwd = path.isAbsolute(raw)
		? path.resolve(raw)
		: path.resolve(root, cleanRelative(raw, root));
	if (!cwd.toLowerCase().startsWith(root.toLowerCase())) {
		throw new Error("Command cwd outside root is blocked: " + cwd);
	}
	return cwd;
}

function boundedTimeout(value, fallback = FOUR_MINUTES_MS) {
	const number = Number(value || fallback || FOUR_MINUTES_MS);
	return Math.max(1000, Math.min(
		Number.isFinite(number) ? Math.floor(number) : FOUR_MINUTES_MS,
		commandMaxTimeout()
	));
}

function maxOutputChars(config, payload) {
	const requested = Number(payload.maxChars || config.command.maxOutput || 120000);
	const maximum = Number(process.env.AWTSMOOS_COMMAND_MAX_OUTPUT_CHARS || 5000000);
	return Math.max(1000, Math.min(requested, maximum));
}

function defaultShellName() {
	return process.platform === "win32" ? "powershell" : "bash";
}

function cleanRelative(given, root) {
	let value = String(given || ".").replace(/\\/g, "/").replace(/^\/+/, "");
	const rootName = path.basename(root).toLowerCase();
	if (value.toLowerCase() === rootName) return ".";
	if (value.toLowerCase().startsWith(rootName + "/")) {
		value = value.slice(rootName.length + 1);
	}
	return value || ".";
}

function commandMaxTimeout() {
	const value = Number(process.env.AWTSMOOS_COMMAND_MAX_TIMEOUT_MS || 24 * 60 * 60 * 1000);
	return Number.isFinite(value)
		? Math.max(FOUR_MINUTES_MS, Math.min(value, 7 * 24 * 60 * 60 * 1000))
		: 24 * 60 * 60 * 1000;
}

module.exports = {
	boundedTimeout,
	commandAllowed,
	commandText,
	defaultShellName,
	disabled,
	maxOutputChars,
	safeCwd,
	wantsSync
};
