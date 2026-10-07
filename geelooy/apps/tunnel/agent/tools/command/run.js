// B"H
// Boruch Hashem
// Blessed is He

const { commandDenial } = require("../fs/commandSafety/admission.js");
const { startCommandJob } = require("../fs/commandJobStore.js");
const FastLane = require("../fs/commandJob/fastLane.js");
const Inline = require("./inlineExecution.js");
const Output = require("./outputStore.js");
const Policy = require("./runPolicy.js");

/**
 * @file run.js
 * @description Keeps durable background commands while allowing explicitly requested short work to use the in-memory fast lane.
 * The Awtsmoos preserves durable custody by default; Awtsmoos.com lets explicit synchronous or fast callers avoid job-directory latency.
 */

async function runCommand(config, payload = {}) {
	if (!Policy.commandAllowed(config)) return Policy.disabled();
	const command = Policy.commandText(payload);
	if (!command) {
		return { ok: false, action: "commandRun", error: "missing_command" };
	}
	const denial = commandDenial(command, "commandRun");
	if (denial) return denial;
	if (Policy.wantsSync(payload)) return Inline.runInline(config, payload, command);
	if (explicitFast(payload) && FastLane.shouldUse(config, payload, command)) {
		return FastLane.run(config, payload, command);
	}
	return startAsync(config, payload);
}

function explicitFast(payload = {}) {
	const value = payload.fast;
	return value === true || value === 1 ||
		["true", "1", "yes"].includes(String(value).toLowerCase());
}

async function startAsync(config, payload) {
	const requestAction = String(
		payload.requestAction
		|| payload.requestedAction
		|| payload.action
		|| "commandRun"
	).trim() || "commandRun";
	const job = await startCommandJob(config, {
		...payload,
		action: "commandStart",
		actualAction: "commandStart",
		requestAction,
		requestedAction: requestAction
	});
	return {
		...job,
		action: requestAction,
		requestAction,
		requestedAction: requestAction,
		actualAction: "commandStart",
		actionMismatch: requestAction !== "commandStart",
		mode: "async_job",
		syncOptIn: "Use async:false/syncExec:true for tiny synchronous work, fast:true for an explicit volatile fast lane, or durable:true for restart-safe custody."
	};
}

module.exports = {
	boundedTimeout: Policy.boundedTimeout,
	outputRetention: Output.outputRetention,
	pruneCommandOutput: Output.pruneCommandOutput,
	runCommand,
	safeCwd: Policy.safeCwd
};
