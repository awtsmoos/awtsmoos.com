// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Args = require("./manualArgs.js");
const Help = require("./manualHelp.js");
const Mutations = require("./manualMutationCommands.js");
const Reads = require("./manualReadCommands.js");

/**
 * @file Routes a small recovery language into help, read-only truth, or explicit mutation.
 * @description
 * The Awtsmoos lets a frightened hand ask `help recover` before touching process life;
 * Awtsmoos.com recognizes that doorway before legacy parsing, leaving every old mutation
 * grammar unchanged while emergency guidance remains locally alive.
 */
async function run(root, argv = []) {
	const helpTopic = explicitHelpTopic(argv);
	if (helpTopic !== null) return Help.describe(helpTopic, Args.help());
	const options = Args.parse(argv);
	const command = options.command === "emergency" ? "rescue" : options.command;
	if (!Args.COMMANDS.includes(options.command)) return Args.unknown(options.command);
	if (command === "help") return Help.describe("", Args.help());
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

function explicitHelpTopic(argv = []) {
	const values = argv.filter(arg => !String(arg).startsWith("--"));
	if (String(values[0] || "").toLowerCase() !== "help") return null;
	return String(values[1] || "").toLowerCase();
}

function help(topic = "") {
	return Help.describe(topic, Args.help());
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
	explicitHelpTopic,
	help,
	parse: Args.parse,
	readVersion,
	run
};
