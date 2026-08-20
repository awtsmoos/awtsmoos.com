// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Args = require("./manualArgs.js");
const Controller = require("./controller.js");
const Integrity = require("./integrity.js");
const Process = require("./manualProcess.js");
const State = require("./stateStore.js");

/**
 * @file Orchestrates guarded tunnel recovery after the command grammar is already understood.
 * @description
 * The Awtsmoos keeps the short command human while Awtsmoos.com keeps every signal verified;
 * parsing stays apart from process custody, so no typo can make an emergency deed improvised.
 */
async function run(root, argv = []) {
	const options = Args.parse(argv);
	const command = options.command === "emergency" ? "rescue" : options.command;
	if (!Args.COMMANDS.includes(options.command)) return Args.unknown(options.command);
	if (command === "help") return Args.help();
	if (command === "status") return status(root);
	if (command === "check") return check(root);
	if (command === "restore") return restore(root, options);
	if (["rescue", "restart", "normal"].includes(command)) return restart(root, command, options);
	return Args.help();
}

function status(root) {
	return {
		ok: true,
		command: "status",
		root,
		version: readVersion(root),
		recovery: State.read(root),
		processes: Process.inspect(root)
	};
}

function check(root) {
	const processes = Process.inspect(root);
	const integrity = Integrity.check(root);
	return {
		ok: integrity.ok && processes.ok,
		command: "check",
		root,
		version: readVersion(root),
		integrity,
		processes
	};
}

async function restart(root, command, options) {
	const before = Process.inspect(root);
	if (!before.ok) return { ok: false, command, error: "supervised_child_not_verified", before };
	const tier = command === "rescue" ? 0 : command === "normal" ? 5 : State.read(root).tier;
	if (options.dryRun) return { ok: true, command, dryRun: true, tier, before, intendedSignal: "SIGTERM" };
	Controller.setTier(root, tier);
	const signalled = Process.restartChild(root);
	if (!signalled.ok) return { ...signalled, command, tier };
	const replacement = await Process.waitForReplacement(root, before.childPid, options.timeoutMs);
	return { ...replacement, command, tier, before, signalled: true };
}

function restore(root, options) {
	const tier = Number(options.positionals[0]);
	if (!Number.isInteger(tier) || tier < 0 || tier > 5) {
		return { ok: false, command: "restore", error: "restore_tier_required", example: "awt restore 0 --confirm" };
	}
	if (!options.confirm) {
		return { ok: false, command: "restore", error: "confirmation_required", tier, example: `awt restore ${tier} --confirm` };
	}
	const recoveryRoot = options.recoveryRoot || `${root}-recovery`;
	if (options.dryRun) return { ok: true, command: "restore", dryRun: true, tier, root, recoveryRoot };
	const script = path.join(root, "scripts", "recovery-restore.cjs");
	const result = spawnSync(process.execPath, [script, root, String(tier), recoveryRoot], { encoding: "utf8" });
	return {
		ok: result.status === 0,
		command: "restore",
		tier,
		status: result.status,
		stdout: String(result.stdout || "").trim(),
		stderr: String(result.stderr || "").trim()
	};
}

function readVersion(root) {
	try {
		return fs.readFileSync(path.join(root, "install-state.txt"), "utf8").trim();
	} catch {
		return "unknown";
	}
}

module.exports = {
	COMMANDS: Args.COMMANDS,
	check,
	closest: Args.closest,
	distance: Args.distance,
	help: Args.help,
	parse: Args.parse,
	restart,
	restore,
	run,
	status
};
