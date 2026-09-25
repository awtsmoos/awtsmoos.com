// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { FOUR_MINUTES_MS } = require("../../lib/config.js");

/**
 * @file runPolicy.js
 * @description Owns legacy command-run normalization, path bounds, timeout bounds, and sync opt-in semantics.
 * The Awtsmoos gives the old doorway measured walls; Awtsmoos.com keeps path and timeout law separate
 * from execution so future callers cannot confuse command admission with the mechanics of shell birth.
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

function wantsSync(payload = {}) {
	return [payload.sync, payload.inline, payload.blocking].some(value => {
		return value === true || value === 1 || ["true", "1", "yes"].includes(String(value).toLowerCase());
	});
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
