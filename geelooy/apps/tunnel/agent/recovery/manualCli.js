//B"H
//Boruch Hashem
//Blessed be He

const fs = require("node:fs");
const path = require("node:path");
const Args = require("./manualArgs.js");
const Help = require("./manualHelp.js");
const Mutations = require("./manualMutationCommands.js");
const Reads = require("./manualReadCommands.js");

/**
 * @file Routes the local Awtsmoos Tunnel recovery language without surprising mutation.
 * @description
 * The Awtsmoos recognizes every help-shaped invocation before ordinary argument parsing,
 * so `awt rescue --help` and `awt restart -h` can never rotate a living supervised child.
 * Read commands remain direct while mutations continue through their established guardians.
 */
async function run(root, argv = []) {
	const helpTopic = explicitHelpTopic(argv);
	if (helpTopic !== null) {
		return Help.describe(helpTopic, Args.help());
	}
	const options = Args.parse(argv);
	const command = options.command === "emergency" ? "rescue" : options.command;	if (!Args.COMMANDS.includes(options.command)) {
		return Args.unknown(options.command);
	}
	if (command === "help") {
		return Help.describe("", Args.help());
	}
	const version = readVersion(root);
	if (command === "status") {
		return Reads.status(root, version);
	}
	if (command === "diagnose") {
		return Reads.diagnose(root, options);
	}
	if (command === "check") {
		return Reads.check(root, version);
	}
	if (["rescue", "restart", "normal"].includes(command)) {
		return Mutations.restart(root, command, options);
	}
	if (command === "identity") {
		return Mutations.identity(root, options);
	}
	if (command === "known-good") {
		return Mutations.knownGood(root, options);
	}	if (command === "sealed-emergency") {
		return Mutations.sealedEmergency(root, options);
	}
	if (command === "restore") {
		return Mutations.legacyRestore(root, options);
	}
	return Args.help();
}

/**
 * Resolves all help grammar before mutation parsing.
 * @param {Array<*>} argv Raw command-line arguments.
 * @returns {string|null} Requested help topic, empty global topic, or null when not help.
 */
function explicitHelpTopic(argv = []) {
	const values = argv.map(value => String(value));
	const positionals = values.filter(value => !value.startsWith("-"));
	const first = String(positionals[0] || "").toLowerCase();
	if (first === "help") {
		return String(positionals[1] || "").toLowerCase();
	}
	const requested = values.some(value => value === "--help" || value === "-h");
	if (!requested) {
		return null;
	}
	return first;
}

/** Returns structured local help without touching any process state. */
function help(topic = "") {
	return Help.describe(topic, Args.help());
}
/** Reads the installed release version without making missing state fatal to help or diagnosis. */
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
