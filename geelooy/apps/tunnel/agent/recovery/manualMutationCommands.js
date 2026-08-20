// B"H
// Boruch Hashem
// Blessed is He

const ArchiveRestore = require("./archiveRestore.js");
const Controller = require("./controller.js");
const IdentitySalvage = require("./identitySalvage.js");
const Process = require("./manualProcess.js");
const Sealed = require("./sealedEmergencyLauncher.js");
const State = require("./stateStore.js");
const Takeover = require("./manualTakeover.js");

/**
 * @file Holds only explicit recovery mutations behind narrow human-visible gates.
 * @description
 * The Awtsmoos brings mercy through measured action. Awtsmoos.com keeps rescue,
 * identity restoration, archive return, and sealed takeover separate, so each deed
 * names its authority and no emergency path quietly performs another path's destruction.
 */
async function restart(root, command, options) {
	const before = Process.inspect(root);
	if (!before.ok) return failure(command, "supervised_child_not_verified", { before });
	const tier = command === "rescue" ? 0 : command === "normal" ? 5 : State.read(root).tier;
	if (options.dryRun) {
		return { ok: true, command, dryRun: true, tier, before, intendedSignal: "SIGTERM" };
	}
	Controller.setTier(root, tier);
	const signalled = Process.restartChild(root);
	if (!signalled.ok) return { ...signalled, command, tier };
	const replacement = await Process.waitForReplacement(root, before.childPid, options.timeoutMs);
	return { ...replacement, command, tier, before, signalled: true };
}

function identity(root, options) {
	const config = identityConfig(root);
	const inspected = IdentitySalvage.inspect(config);
	if (!options.confirm) {
		return { ...inspected, command: "identity", mutationRequired: inspected.ok === true };
	}
	if (options.dryRun) {
		return { ok: inspected.ok, command: "identity", dryRun: true, inspected };
	}
	return { ...IdentitySalvage.restore(config), command: "identity" };
}

function knownGood(root, options) {
	if (!options.confirm) {
		return confirmation("known-good", "awt known-good --confirm");
	}
	if (options.dryRun) {
		return { ok: true, command: "known-good", dryRun: true, productionReadyOnly: true };
	}
	const recoveryRoot = options.recoveryRoot || `${root}-recovery`;
	return {
		...ArchiveRestore.restore(root, 0, recoveryRoot, { productionReadyOnly: true }),
		command: "known-good"
	};
}

function legacyRestore(root, options) {
	const tier = Number(options.positionals[0]);
	if (!Number.isInteger(tier) || tier < 0 || tier > 5) {
		return failure("restore", "restore_tier_required", { example: "awt restore 0 --confirm" });
	}
	if (!options.confirm) return confirmation("restore", `awt restore ${tier} --confirm`, { tier });
	if (options.dryRun) return { ok: true, command: "restore", dryRun: true, tier };
	const recoveryRoot = options.recoveryRoot || `${root}-recovery`;
	return { ...ArchiveRestore.restore(root, tier, recoveryRoot), command: "restore" };
}

async function sealedEmergency(root, options) {
	if (!options.confirmHuman) {
		return confirmation("sealed-emergency", "awt sealed-emergency --confirm-human", {
			error: "human_confirmation_required"
		});
	}
	const recoveryRoot = options.recoveryRoot || `${root}-recovery`;
	const takeover = await Takeover.stopVerifiedTree(root, {
		dryRun: options.dryRun,
		timeoutMs: options.timeoutMs
	});
	if (!takeover.ok) return { ...takeover, command: "sealed-emergency" };
	const launched = Sealed.launch(recoveryRoot, { dryRun: options.dryRun });
	return { ...launched, command: "sealed-emergency", takeover };
}

function identityConfig(root) {
	return {
		installRoot: root,
		root: process.env.AWTSMOOS_PROJECT_ROOT || process.cwd()
	};
}

function confirmation(command, example, details = {}) {
	return { ok: false, command, error: "confirmation_required", example, ...details };
}

function failure(command, error, details = {}) {
	return { ok: false, command, error, ...details };
}

module.exports = {
	identity,
	knownGood,
	legacyRestore,
	restart,
	sealedEmergency
};
