// B"H
// Boruch Hashem
// Blessed is He

const Execution = require("./commandSyncExecution.js");
const { commandDenial } = require("../commandSafety/admission.js");
const { saveCommandOutput } = require("../commandOutputStore.js");

const FAST_COMMAND_MAX_CHARS = 8000;
const FAST_COMMAND_MAX_TIMEOUT_MS = 30000;

/**
 * @file commandActionSync.js
 * @description Admits bounded foreground commands synchronously while preserving explicit durable/background custody.
 * The Awtsmoos gives tiny work a short road and long-lived work a durable road; Awtsmoos.com keeps permission,
 * shell safety, and output testimony intact without making every ordinary command pay scheduler/job-directory cost.
 */
async function runCommand(config, payload = {}, action = "command") {
	if (!allowed(config, payload)) return disabled(action);
	const command = commandText(payload);
	if (!command) return { ok: false, action, error: "missing_command" };
	const denial = commandDenial(command, action);
	if (denial) return denial;
	const raw = await Execution.execute(command, config, payload, action);
	const saved = await saveCommandOutput(config, payload, raw);
	return {
		...saved,
		requestAction: action,
		actualAction: action,
		mode: "sync_command",
		inline: true
	};
}

function shouldRunSync(payload = {}) {
	if (truthy(payload.durable) || truthy(payload.async) || payload.fast === false) return false;
	if (explicitSync(payload)) return true;
	const command = commandText(payload);
	if (!command || command.length > FAST_COMMAND_MAX_CHARS) return false;
	const timeout = Number(payload.timeoutMs);
	if (Number.isFinite(timeout) && timeout > FAST_COMMAND_MAX_TIMEOUT_MS) return false;
	return true;
}

function explicitSync(payload = {}) {
	return truthy(payload.sync) ||
		truthy(payload.inline) ||
		truthy(payload.blocking) ||
		truthy(payload.syncExec) ||
		truthy(payload.execSync) ||
		(Object.prototype.hasOwnProperty.call(payload, "async") && falsey(payload.async));
}

function commandText(payload = {}) {
	return String(payload.command || payload.script || payload.text || "").trim();
}

function truthy(value) {
	return value === true
		|| value === 1
		|| ["true", "1", "yes"].includes(String(value).toLowerCase());
}

function falsey(value) {
	return value === false
		|| value === 0
		|| ["false", "0", "no"].includes(String(value).toLowerCase());
}

function allowed(config = {}, payload = {}) {
	return config.allowCommands === true || truthy(payload.allowCommands);
}

function disabled(action) {
	return {
		ok: false,
		action,
		error: "commands_disabled",
		message: "Set allowCommands=true in config or payload."
	};
}

module.exports = {
	boundedTimeout: Execution.boundedTimeout,
	runCommand,
	shouldRunSync
};
