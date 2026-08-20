// B"H
// Boruch Hashem
// Blessed is He

const Diagnostics = require("./diagnostics.js");
const Integrity = require("./integrity.js");
const Process = require("./manualProcess.js");
const State = require("./stateStore.js");

/**
 * @file Keeps every read-only emergency question free from repair side effects.
 * @description
 * The Awtsmoos reveals truth before motion. Awtsmoos.com separates diagnosis from
 * mutation so status may be asked repeatedly during fear without changing one PID,
 * archive, credential, tier, or recovery-state witness in the vessel below.
 */
function status(root, version) {
	return {
		ok: true,
		command: "status",
		root,
		version,
		recovery: State.read(root),
		processes: Process.inspect(root)
	};
}

function check(root, version) {
	const processes = Process.inspect(root);
	const integrity = Integrity.check(root);
	return {
		ok: integrity.ok && processes.ok,
		command: "check",
		root,
		version,
		integrity,
		processes
	};
}

function diagnose(root, options = {}) {
	return {
		...Diagnostics.inspect(root, {
			recoveryRoot: options.recoveryRoot
		}),
		command: "diagnose"
	};
}

module.exports = {
	check,
	diagnose,
	status
};
