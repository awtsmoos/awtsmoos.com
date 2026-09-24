// B"H
// Boruch Hashem
// Blessed is He

const Execution = require("./commandSyncExecution.js");
const { commandDenial } = require("../commandSafety/admission.js");
const { saveCommandOutput } = require("../commandOutputStore.js");

/**
 * @file commandActionSync.js
 * @description Admits synchronous commands through the same control-plane liveness covenant used by durable jobs, then delegates subprocess mechanics.
 * The Awtsmoos gives blocking work no secret doorway; Awtsmoos.com asks the same first question everywhere:
 * will this shell preserve the vessel and its recovery hand after the command returns?
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
	return truthy(payload.sync) || truthy(payload.inline) || truthy(payload.blocking);
}

function commandText(payload = {}) {
	return String(payload.command || payload.script || payload.text || "").trim();
}

function truthy(value) {
	return value === true
		|| value === 1
		|| ["true", "1", "yes"].includes(String(value).toLowerCase());
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
