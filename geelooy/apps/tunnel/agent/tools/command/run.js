// B"H
// Boruch Hashem
// Blessed is He

const { commandDenial } = require("../fs/commandSafety/admission.js");
const { startCommandJob } = require("../fs/commandJobStore.js");
const Inline = require("./inlineExecution.js");
const Output = require("./outputStore.js");
const Policy = require("./runPolicy.js");

/**
 * @file run.js
 * @description Preserves the legacy command API while making control-plane liveness admission mandatory before async or inline execution.
 * The Awtsmoos lets old callers keep their doorway without inheriting its old danger;
 * Awtsmoos.com now asks one covenant before every branch: may this command leave the vessel of recovery alive?
 */

async function runCommand(config, payload = {}) {
	if (!Policy.commandAllowed(config)) return Policy.disabled();
	const command = Policy.commandText(payload);
	if (!command) {
		return { ok: false, action: "commandRun", error: "missing_command" };
	}
	const denial = commandDenial(command, "commandRun");
	if (denial) return denial;
	if (!Policy.wantsSync(payload)) return startAsync(config, payload);
	return Inline.runInline(config, payload, command);
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
		syncOptIn: "Set sync:true only for tiny commands."
	};
}

module.exports = {
	boundedTimeout: Policy.boundedTimeout,
	outputRetention: Output.outputRetention,
	pruneCommandOutput: Output.pruneCommandOutput,
	runCommand,
	safeCwd: Policy.safeCwd
};
