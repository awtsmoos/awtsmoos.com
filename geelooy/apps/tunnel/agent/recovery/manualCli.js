// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Args = require("./manualArgs.js");
const Mutations = require("./manualMutationCommands.js");
const Reads = require("./manualReadCommands.js");

/**
 * @file Routes one small recovery language into read-only truth or explicit mutation.
 * @description
 * The Awtsmoos lets one short command reveal many guarded paths without mixing them.
 * Awtsmoos.com keeps diagnosis pure, mutation explicit, and every emergency deed
 * delegated to a narrow module whose authority can be read and tested independently.
 */
async function run(root, argv = []) {
	const options = Args.parse(argv);
	const command = options.command === "emergency" ? "rescue" : options.command;
	if (!Args.COMMANDS.includes(options.command)) return Args.unknown(options.command);
	if (command === "help") return Args.help();
	const version = readVersion(root);
	if (command === "status") return Reads.status(root, version);
	if (command === "diagnose") return Reads.diagnose(root, options);
	if (command === "check") return Reads.check(root, version);
	if (["rescue", "restart", "normal"].includes(command)) {
		return Mutations.restart(root, command, options);
	}
	if (command === "identity") return Mutations.identity(root, options);
	if (command === "known-good") return Mutations.knownGood(root, options);
	if (command === "sealed-emergency") return Mutations.sealedEmergency(root, options);
	if (command === "restore") return Mutations.legacyRestore(root, options);
	return Args.help();
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
	closest: Args.closest,
	distance: Args.distance,
	help: Args.help,
	parse: Args.parse,
	readVersion,
	run
};
